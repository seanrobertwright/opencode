import { DialogSelect, type DialogSelectOption } from "@tui/ui/dialog-select"
import { useDialog } from "@tui/ui/dialog"
import { useSync } from "@tui/context/sync"
import { createMemo } from "solid-js"
import { AgentProcess } from "@/agent-process"
import { DialogAgentActions } from "./dialog-agent-actions"

export function DialogAgentList() {
  const dialog = useDialog()
  const sync = useSync()

  const options = createMemo((): DialogSelectOption<string>[] => {
    const agents = Object.values(sync.data.agent_process).sort((a, b) => a.createdAt - b.createdAt)
    return agents.map((agent) => ({
      title: agent.title,
      value: agent.id,
      description: agent.status,
      footer: AgentProcess.getStatusIcon(agent.status),
    }))
  })

  return (
    <DialogSelect
      title="Agents"
      options={options()}
      onSelect={(option) => {
        const agent = sync.data.agent_process[option.value]
        if (agent) {
          dialog.replace(() => <DialogAgentActions agent={agent} />)
        }
      }}
    />
  )
}
