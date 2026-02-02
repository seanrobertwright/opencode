import { DialogSelect, type DialogSelectOption } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { DialogPrompt } from "@tui/ui/dialog-prompt"
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
            dialog.replace(() => (
              <DialogPrompt
                title={`Prompt ${props.agent.title}`}
                placeholder="Enter a prompt for this agent"
                onConfirm={async (value) => {
                  const prompt = value.trim()
                  if (!prompt) {
                    toast.show({ message: "Prompt is required", variant: "error" })
                    return
                  }
                  const res = await sdk.client.agentProcess.sendPrompt({
                    id: props.agent.id,
                    prompt,
                    directory: directory(),
                  })
                  if (res.error || !res.data?.success) {
                    const text = res.error ? (typeof res.error === "string" ? res.error : JSON.stringify(res.error)) : ""
                    toast.show({ message: `Failed to send prompt${text ? `: ${text}` : ""}`, variant: "error" })
                    return
                  }
                  toast.show({ message: "Prompt sent", variant: "success" })
                  dialog.clear()
                }}
                onCancel={() => dialog.clear()}
              />
            ))
            break
          }
          case "cancel": {
            const res = await sdk.client.agentProcess.cancel({
              id: props.agent.id,
              directory: directory(),
            })
            if (res.error || !res.data?.success) {
              toast.show({ message: "Failed to cancel agent", variant: "error" })
            } else {
              toast.show({ message: "Cancelled", variant: "success" })
            }
            dialog.clear()
            break
          }
          case "stop": {
            const res = await sdk.client.agentProcess.stop({
              id: props.agent.id,
              directory: directory(),
            })
            if (res.error || !res.data?.success) {
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
