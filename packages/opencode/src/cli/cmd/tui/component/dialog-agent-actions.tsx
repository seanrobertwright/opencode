import { DialogSelect, type DialogSelectOption } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { useSDK } from "@tui/context/sdk"
import { useToast } from "@tui/ui/toast"
import { useSync } from "@tui/context/sync"
import type { AgentProcess } from "@/agent-process"

interface DialogAgentActionsProps {
  agent: AgentProcess.Info
}

export function DialogAgentActions(props: DialogAgentActionsProps) {
  const dialog = useDialog()
  const sdk = useSDK()
  const toast = useToast()
  const sync = useSync()
  // Use raw directory path - useDirectory() adds branch suffix which breaks the server
  const directory = () => sync.data.path.directory || process.cwd()

  const options: DialogSelectOption<string>[] = [
    {
      title: "Send prompt",
      value: "prompt",
      description: "Send a new prompt to this agent",
    },
    {
      title: "Cancel",
      value: "cancel",
      description: "Cancel current operation",
      disabled: props.agent.status !== "working",
    },
    {
      title: "Stop",
      value: "stop",
      description: "Stop and remove this agent",
    },
  ]

  return (
    <DialogSelect
      title={`Agent: ${props.agent.title}`}
      options={options}
      onSelect={async (option) => {
        switch (option.value) {
          case "prompt": {
            dialog.clear()
            // TODO: Show prompt dialog
            break
          }
          case "cancel": {
            const res = await fetch(`${sdk.url}/agent-process/${props.agent.id}/cancel`, {
              method: "POST",
              headers: { "x-opencode-directory": directory() },
            })
            if (!res.ok) {
              toast.show({ message: "Failed to cancel agent", variant: "error" })
            } else {
              toast.show({ message: "Cancelled", variant: "success" })
            }
            dialog.clear()
            break
          }
          case "stop": {
            const res = await fetch(`${sdk.url}/agent-process/${props.agent.id}/stop`, {
              method: "POST",
              headers: { "x-opencode-directory": directory() },
            })
            if (!res.ok) {
              toast.show({ message: "Failed to stop agent", variant: "error" })
            } else {
              toast.show({ message: "Agent stopped", variant: "success" })
            }
            dialog.clear()
            break
          }
        }
      }}
    />
  )
}
