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
        const res = await fetch(`${sdk.url}/agent-process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-opencode-directory": directory(),
          },
          body: JSON.stringify({
            parentSessionID: props.sessionID,
            title: title.trim(),
          }),
        })
        if (!res.ok) {
          const text = await res.text().catch(() => "Unknown error")
          toast.show({ message: `Failed to spawn agent: ${text}`, variant: "error" })
          return
        }
        toast.show({ message: `Agent "${title}" spawned`, variant: "success" })
        dialog.clear()
      }}
      onCancel={() => dialog.clear()}
    />
  )
}
