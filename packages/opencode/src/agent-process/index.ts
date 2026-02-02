import { Bus } from "@/bus"
import { BusEvent } from "@/bus/bus-event"
import { Identifier } from "@/id/id"
import { Log } from "@/util/log"
import { Session } from "@/session"
import { SessionPrompt } from "@/session/prompt"
import { Instance } from "@/project/instance"
import z from "zod"

/**
 * AgentProcess - Manages parallel agent sessions within the TUI.
 *
 * Each "agent" is a child session that can run prompts independently.
 * This enables true parallel execution of multiple AI agents while
 * leveraging the existing session infrastructure.
 */
export namespace AgentProcess {
  const log = Log.create({ service: "agent-process" })

  export const Status = z.enum(["starting", "running", "idle", "working", "error", "stopped"])
  export type Status = z.infer<typeof Status>

  export const Info = z.object({
    id: z.string(),
    sessionID: z.string(),
    parentSessionID: z.string(),
    title: z.string(),
    status: Status,
    agent: z.string().optional(),
    model: z
      .object({
        providerID: z.string(),
        modelID: z.string(),
      })
      .optional(),
    error: z.string().optional(),
    lastActivity: z.number(),
    createdAt: z.number(),
  })
  export type Info = z.infer<typeof Info>

  export const Event = {
    Created: BusEvent.define(
      "agent-process.created",
      z.object({
        info: Info,
      }),
    ),
    Updated: BusEvent.define(
      "agent-process.updated",
      z.object({
        info: Info,
      }),
    ),
    Stopped: BusEvent.define(
      "agent-process.stopped",
      z.object({
        id: z.string(),
      }),
    ),
  }

  // In-memory registry of active agent processes
  const agents = new Map<string, AgentHandle>()

  interface AgentHandle {
    info: Info
  }

  export function list(): Info[] {
    return Array.from(agents.values()).map((a) => a.info)
  }

  export function get(id: string): Info | undefined {
    return agents.get(id)?.info
  }

  export function getBySessionID(sessionID: string): Info | undefined {
    for (const handle of Array.from(agents.values())) {
      if (handle.info.sessionID === sessionID) return handle.info
    }
    return undefined
  }

  export async function spawn(opts: {
    parentSessionID: string
    title: string
    agent?: string
    model?: { providerID: string; modelID: string }
    prompt?: string
  }): Promise<Info> {
    const id = Identifier.ascending("agent")
    const now = Date.now()

    log.info("spawning agent", { id, parentSessionID: opts.parentSessionID, title: opts.title })

    // Validate parent session exists (optional - agents can be standalone)
    const parentExists = await Session.get(opts.parentSessionID).catch(() => null)
    const parentID = parentExists ? opts.parentSessionID : undefined

    // Create a child session for this agent
    const session = await Session.createNext({
      parentID,
      directory: Instance.worktree,
      title: `Agent: ${opts.title}`,
    })

    log.info("agent session created", { id, sessionID: session.id, parentID })

    // Verify session was persisted
    const verifySession = await Session.get(session.id).catch((e) => {
      log.error("session verification failed - session not persisted", { sessionID: session.id, error: e })
      return null
    })

    if (!verifySession) {
      throw new Error(`Failed to create session for agent: session ${session.id} not persisted`)
    }

    const info: Info = {
      id,
      sessionID: session.id,
      parentSessionID: opts.parentSessionID,
      title: opts.title,
      status: "idle",
      agent: opts.agent,
      model: opts.model,
      lastActivity: now,
      createdAt: now,
    }

    const handle: AgentHandle = { info }
    agents.set(id, handle)

    Bus.publish(Event.Created, { info })

    // Send initial prompt if provided
    if (opts.prompt) {
      sendPrompt(id, opts.prompt).catch((err) => {
        log.error("failed to send initial prompt", { id, error: err })
      })
    }

    return info
  }

  function updateStatus(id: string, status: Status, error?: string) {
    const handle = agents.get(id)
    if (!handle) return
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/0b24d0a3-30e2-4cf7-84c6-becac3c687aa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "agent-status-pre-fix",
        hypothesisId: "U1",
        location: "agent-process/index.ts:updateStatus",
        message: "agent process status update",
        data: {
          id,
          from: handle.info.status,
          to: status,
          error: error ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    handle.info.status = status
    handle.info.lastActivity = Date.now()
    if (error) handle.info.error = error

    Bus.publish(Event.Updated, { info: handle.info })
  }

  export async function sendPrompt(id: string, prompt: string): Promise<void> {
    const handle = agents.get(id)
    if (!handle) throw new Error(`Agent not found: ${id}`)
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/0b24d0a3-30e2-4cf7-84c6-becac3c687aa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "agent-status-pre-fix",
        hypothesisId: "U2",
        location: "agent-process/index.ts:sendPrompt",
        message: "agent process sendPrompt",
        data: {
          id,
          sessionID: handle.info.sessionID,
          promptLength: prompt.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    const { info } = handle

    // Check if session is busy
    try {
      SessionPrompt.assertNotBusy(info.sessionID)
    } catch {
      throw new Error(`Agent ${id} is busy`)
    }

    updateStatus(id, "working")

    try {
      await SessionPrompt.prompt({
        sessionID: info.sessionID,
        parts: [{ type: "text", text: prompt }],
        model: info.model,
        agent: info.agent,
      })
      updateStatus(id, "idle")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      updateStatus(id, "error", message)
      throw err
    }
  }

  export function cancel(id: string): void {
    const handle = agents.get(id)
    if (!handle) return

    log.info("canceling agent", { id })
    SessionPrompt.cancel(handle.info.sessionID)
    updateStatus(id, "idle")
  }

  export function stop(id: string): void {
    const handle = agents.get(id)
    if (!handle) return

    log.info("stopping agent", { id })

    // Cancel any active work
    SessionPrompt.cancel(handle.info.sessionID)

    // Remove from registry
    agents.delete(id)

    Bus.publish(Event.Stopped, { id })
  }

  export function stopAll(): void {
    const ids = Array.from(agents.keys())
    for (const id of ids) {
      stop(id)
    }
  }

  export function getStatusIcon(status: Status): string {
    switch (status) {
      case "starting":
        return "◔"
      case "running":
        return "●"
      case "idle":
        return "○"
      case "working":
        return "◉"
      case "error":
        return "✗"
      case "stopped":
        return "◌"
    }
  }

  export function getStatusColor(status: Status): "success" | "error" | "warning" | "muted" | "text" {
    switch (status) {
      case "starting":
        return "muted"
      case "running":
        return "success"
      case "idle":
        return "text"
      case "working":
        return "warning"
      case "error":
        return "error"
      case "stopped":
        return "muted"
    }
  }
}
