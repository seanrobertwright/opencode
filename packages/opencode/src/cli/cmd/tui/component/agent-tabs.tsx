import { createMemo, createSignal, For, Show } from "solid-js"
import type { Session } from "@opencode-ai/sdk/v2"
import { useSync } from "@tui/context/sync"
import { useTheme, selectedForeground } from "@tui/context/theme"
import { useRoute } from "@tui/context/route"
import { useDialog } from "@tui/ui/dialog"
import { useSDK } from "@tui/context/sdk"
import { useToast } from "@tui/ui/toast"
import { DialogAgentSpawn } from "./dialog-agent-spawn"
import { AgentProcess } from "@/agent-process"

export function AgentTabs(props: { sessionID?: string }) {
  const sync = useSync()
  const { theme } = useTheme()
  const route = useRoute()
  const dialog = useDialog()
  const sdk = useSDK()
  const toast = useToast()
  const [spawning, setSpawning] = createSignal(false)
  const directory = () => sync.data.path.directory || process.cwd()

  const mainSessionID = createMemo(() => {
    if (props.sessionID) {
      const session = sync.session.get(props.sessionID)
      if (!session) return props.sessionID
      return session.parentID ?? session.id
    }
    const sessions = sync.data.session.filter((session) => !session.parentID)
    if (sessions.length === 0) return undefined
    return sessions.toSorted((a, b) => b.time.updated - a.time.updated)[0]?.id
  })

  const mainSession = createMemo(() => {
    const id = mainSessionID()
    if (!id) return undefined
    return sync.session.get(id)
  })

  const agents = createMemo(() => {
    const base = mainSessionID()
    const list = Object.values(sync.data.agent_process).toSorted((a, b) => a.createdAt - b.createdAt)
    if (!base) return list
    return list.filter((agent) => agent.parentSessionID === base)
  })

  const activeSessionID = createMemo(() => (route.data.type === "session" ? route.data.sessionID : undefined))

  const openSpawn = async () => {
    if (spawning()) return
    setSpawning(true)
    const base = mainSessionID()
    if (base) {
      dialog.replace(() => (
        <DialogAgentSpawn
          sessionID={base}
          onSpawn={(info) => {
            route.navigate({ type: "session", sessionID: info.sessionID })
          }}
        />
      ))
      setSpawning(false)
      return
    }

    const created = (await sdk.client.session.create(
      {
        directory: directory(),
      },
      {
        throwOnError: false,
      },
    )) as {
      data?: Session
      error?: unknown
    }
    const data = created.data
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/0b24d0a3-30e2-4cf7-84c6-becac3c687aa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "spawn-pre-fix",
        hypothesisId: "S5",
        location: "component/agent-tabs.tsx:openSpawn.create",
        message: "session create for new agent tab",
        data: {
          hasData: !!data,
          error: created.error ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    if (created.error || !data) {
      const text = created.error ? (typeof created.error === "string" ? created.error : JSON.stringify(created.error)) : ""
      toast.show({ message: `Failed to start session${text ? `: ${text}` : ""}`, variant: "error" })
      setSpawning(false)
      return
    }
    dialog.replace(() => (
        <DialogAgentSpawn
          sessionID={data.id}
          onSpawn={(info) => {
            // #region agent log
            fetch("http://127.0.0.1:7243/ingest/0b24d0a3-30e2-4cf7-84c6-becac3c687aa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: "debug-session",
                runId: "spawn-pre-fix",
                hypothesisId: "S6",
                location: "component/agent-tabs.tsx:openSpawn.navigate",
                message: "navigate to agent session after spawn",
                data: {
                  sessionID: info.sessionID,
                  agentID: info.id,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {})
            // #endregion
            route.navigate({ type: "session", sessionID: info.sessionID })
          }}
        />
    ))
    setSpawning(false)
  }

  const stopAgent = async (agent: AgentProcess.Info) => {
    const res = await sdk.client.agentProcess.stop({
      id: agent.id,
      directory: directory(),
    })
    if (res.error || !res.data?.success) {
      const text = res.error ? (typeof res.error === "string" ? res.error : JSON.stringify(res.error)) : ""
      toast.show({ message: `Failed to stop agent${text ? `: ${text}` : ""}`, variant: "error" })
      return
    }
    if (activeSessionID() !== agent.sessionID) return
    const base = mainSessionID()
    if (base) {
      route.navigate({ type: "session", sessionID: base })
      return
    }
    route.navigate({ type: "home" })
  }

  return (
    <box flexShrink={0} paddingLeft={2} paddingRight={2} paddingTop={1} backgroundColor={theme.backgroundPanel}>
      <box flexDirection="row" gap={1} flexWrap="wrap">
        <Show when={mainSession()}>
          {(session) => {
            const active = () => activeSessionID() === session().id
            return (
              <box
                paddingLeft={1}
                paddingRight={1}
                backgroundColor={active() ? theme.accent : theme.backgroundElement}
                onMouseUp={() => route.navigate({ type: "session", sessionID: session().id })}
              >
                <text fg={active() ? selectedForeground(theme, theme.accent) : theme.text}>
                  {session().title}
                </text>
              </box>
            )
          }}
        </Show>
        <For each={agents()}>
          {(agent) => {
            const active = () => activeSessionID() === agent.sessionID
            return (
              <box
                paddingLeft={1}
                paddingRight={1}
                backgroundColor={active() ? theme.accent : theme.backgroundElement}
                onMouseUp={() => route.navigate({ type: "session", sessionID: agent.sessionID })}
              >
                <box flexDirection="row" gap={1}>
                  <text
                    style={{
                      fg: (
                        {
                          starting: theme.textMuted,
                          running: theme.success,
                          idle: theme.text,
                          working: theme.warning,
                          error: theme.error,
                          stopped: theme.textMuted,
                        } as Record<string, typeof theme.success>
                      )[agent.status],
                    }}
                  >
                    {AgentProcess.getStatusIcon(agent.status)}
                  </text>
                  <text fg={active() ? selectedForeground(theme, theme.accent) : theme.text}>{agent.title}</text>
                  <box
                    paddingLeft={1}
                    onMouseUp={(evt: any) => {
                      evt?.stopPropagation?.()
                      stopAgent(agent)
                    }}
                  >
                    <text fg={active() ? selectedForeground(theme, theme.accent) : theme.textMuted}>x</text>
                  </box>
                </box>
              </box>
            )
          }}
        </For>
        <box
          paddingLeft={1}
          paddingRight={1}
          backgroundColor={theme.backgroundElement}
          onMouseUp={openSpawn}
        >
          <text fg={theme.text}>+</text>
        </box>
      </box>
    </box>
  )
}
