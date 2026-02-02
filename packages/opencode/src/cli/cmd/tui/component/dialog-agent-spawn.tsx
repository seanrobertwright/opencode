import { DialogPrompt } from "@tui/ui/dialog-prompt"
import { useDialog } from "@tui/ui/dialog"
import { useSDK } from "@tui/context/sdk"
import { useToast } from "@tui/ui/toast"
import { useSync } from "@tui/context/sync"

interface DialogAgentSpawnProps {
  sessionID: string
}

export function DialogAgentSpawn(props: DialogAgentSpawnProps) {
  const dialog = useDialog()
  const sdk = useSDK()
  const toast = useToast()
  const sync = useSync()
  // Use raw directory path - useDirectory() adds branch suffix which breaks the server
  const directory = () => sync.data.path.directory || process.cwd()

  return (
    <DialogPrompt
      title="Spawn Agent"
      placeholder="Agent title (e.g., 'Research assistant')"
      onConfirm={async (title) => {
        if (!title.trim()) {
          toast.show({ message: "Agent title is required", variant: "error" })
          return
        }
        // #region agent log
        fetch("http://127.0.0.1:7243/ingest/0b24d0a3-30e2-4cf7-84c6-becac3c687aa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "spawn-pre-fix",
            hypothesisId: "S1",
            location: "component/dialog-agent-spawn.tsx:spawn.request",
            message: "agent spawn request start",
            data: {
              sessionID: props.sessionID,
              titleLength: title.trim().length,
              url: sdk.url,
              directory: directory(),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        // #endregion
        const res = await sdk.client.agentProcess.spawn({
          body: {
            parentSessionID: props.sessionID,
            title: title.trim(),
          },
          query: {
            directory: directory(),
          },
        })
        if (res.error) {
          // #region agent log
          fetch("http://127.0.0.1:7243/ingest/0b24d0a3-30e2-4cf7-84c6-becac3c687aa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId: "spawn-pre-fix",
              hypothesisId: "S3",
              location: "component/dialog-agent-spawn.tsx:spawn.response.error",
              message: "agent spawn response error",
              data: {
                error: res.error,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {})
          // #endregion
          const text = typeof res.error === "string" ? res.error : JSON.stringify(res.error)
          toast.show({ message: `Failed to spawn agent: ${text}`, variant: "error" })
          return
        }
        // #region agent log
        fetch("http://127.0.0.1:7243/ingest/0b24d0a3-30e2-4cf7-84c6-becac3c687aa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "spawn-pre-fix",
            hypothesisId: "S3",
            location: "component/dialog-agent-spawn.tsx:spawn.response.ok",
            message: "agent spawn response ok",
            data: {
              hasData: !!res.data,
              id: res.data?.id,
              title: res.data?.title,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        // #endregion
        toast.show({ message: `Agent "${title}" spawned`, variant: "success" })
        dialog.clear()
      }}
      onCancel={() => dialog.clear()}
    />
  )
}
