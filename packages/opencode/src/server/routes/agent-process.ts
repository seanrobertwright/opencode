import { Hono } from "hono"
import { describeRoute, validator, resolver } from "hono-openapi"
import z from "zod"
import { AgentProcess } from "@/agent-process"
import { errors } from "../error"
import { lazy } from "../../util/lazy"

export const AgentProcessRoutes = lazy(() =>
  new Hono()
    .get(
      "/",
      describeRoute({
        summary: "List agent processes",
        description: "Get a list of all running agent processes",
        operationId: "agentProcess.list",
        responses: {
          200: {
            description: "List of agent processes",
            content: {
              "application/json": {
                schema: resolver(AgentProcess.Info.array()),
              },
            },
          },
        },
      }),
      (c) => {
        const list = AgentProcess.list()
        return c.json(list)
      },
    )
    .post(
      "/",
      describeRoute({
        summary: "Spawn a new agent process",
        description: "Start a new headless opencode agent process",
        operationId: "agentProcess.spawn",
        responses: {
          200: {
            description: "Agent process info",
            content: {
              "application/json": {
                schema: resolver(AgentProcess.Info),
              },
            },
          },
        },
      }),
      validator(
        "json",
        z.object({
          parentSessionID: z.string().meta({ description: "ID of the parent session" }),
          title: z.string().meta({ description: "Title for the agent process" }),
          agent: z.string().optional().meta({ description: "Agent type to use" }),
          model: z
            .object({
              providerID: z.string(),
              modelID: z.string(),
            })
            .optional()
            .meta({ description: "Model to use for the agent" }),
          prompt: z.string().optional().meta({ description: "Initial prompt to send to the agent" }),
        }),
      ),
      async (c) => {
        const body = c.req.valid("json")
        const info = await AgentProcess.spawn({
          parentSessionID: body.parentSessionID,
          title: body.title,
          agent: body.agent,
          model: body.model,
          prompt: body.prompt,
        })
        return c.json(info)
      },
    )
    .post(
      "/:id/prompt",
      describeRoute({
        summary: "Send a prompt to an agent process",
        description: "Send a prompt to a running agent process",
        operationId: "agentProcess.sendPrompt",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: resolver(z.object({ success: z.boolean() })),
              },
            },
          },
          404: errors[404],
        },
      }),
      validator(
        "json",
        z.object({
          prompt: z.string().meta({ description: "Prompt to send to the agent" }),
        }),
      ),
      async (c) => {
        const id = c.req.param("id")
        const body = c.req.valid("json")
        try {
          await AgentProcess.sendPrompt(id, body.prompt)
          return c.json({ success: true })
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          return c.json({ error: message }, 404)
        }
      },
    )
    .post(
      "/:id/cancel",
      describeRoute({
        summary: "Cancel an agent process",
        description: "Cancel the current operation of an agent process",
        operationId: "agentProcess.cancel",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: resolver(z.object({ success: z.boolean() })),
              },
            },
          },
          404: errors[404],
        },
      }),
      async (c) => {
        const id = c.req.param("id")
        AgentProcess.cancel(id)
        return c.json({ success: true })
      },
    )
    .post(
      "/:id/stop",
      describeRoute({
        summary: "Stop an agent process",
        description: "Stop and terminate an agent process",
        operationId: "agentProcess.stop",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: resolver(z.object({ success: z.boolean() })),
              },
            },
          },
        },
      }),
      async (c) => {
        const id = c.req.param("id")
        AgentProcess.stop(id)
        return c.json({ success: true })
      },
    ),
)
