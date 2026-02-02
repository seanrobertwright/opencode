# Multi-Agent TUI Orchestration Implementation Plan

## Overview
Implement multi-agent TUI orchestration similar to [kild](https://github.com/Wirasm/kild) - allowing multiple AI agents to run in parallel within the opencode TUI, with status tracking in the sidebar.

## Architecture Decision
After analyzing kild's subprocess-based approach and opencode's existing architecture, the cleanest implementation is:
- **Use sessions as agents** - Each "agent" is a separate opencode session
- **Parallel execution** - Different sessions can run prompts independently  
- **Unified tracking** - Track agent sessions in a dedicated store for sidebar display
- **No subprocess spawning** - Leverage existing session infrastructure

---

## Phase 1: Core Infrastructure

### [🟢] 1.1 Add agent-process identifier prefix
- File: `packages/opencode/src/id/id.ts`
- Added "agent" to the Prefix type union

### [🟢] 1.2 Create AgentProcess module
- File: `packages/opencode/src/agent-process/index.ts`
- Created module with:
  - `Info` schema (id, sessionID, parentSessionID, title, status, agent, model, error, timestamps)
  - `Status` type: "starting" | "running" | "idle" | "working" | "error" | "stopped"
  - `Event` definitions (Created, Updated, Stopped) using BusEvent
  - Session-based agent registry and management functions

### [🟢] 1.3 Add agent_process to sync store
- File: `packages/opencode/src/cli/cmd/tui/context/sync.tsx`
- Added `agent_process: { [id: string]: AgentProcess.Info }` to store
- Added event handlers for agent-process.created, agent-process.updated, agent-process.stopped

---

## Phase 2: Server API

### [🟢] 2.1 Create agent-process server routes
- File: `packages/opencode/src/server/routes/agent-process.ts`
- Endpoints:
  - `GET /agent-process` - List all agent processes
  - `POST /agent-process` - Spawn a new agent process
  - `POST /agent-process/:id/prompt` - Send prompt to agent
  - `POST /agent-process/:id/cancel` - Cancel current operation
  - `POST /agent-process/:id/stop` - Stop and remove agent

### [🟢] 2.2 Register routes in server
- File: `packages/opencode/src/server/server.ts`
- Already registered at line 227: `.route("/agent-process", AgentProcessRoutes())`

---

## Phase 3: TUI Integration

### [🟢] 3.1 Add Agents section to sidebar
- File: `packages/opencode/src/cli/cmd/tui/routes/session/sidebar.tsx`
- Added:
  - `agents: true` to expanded store
  - `agentEntries` memo for sorted agent list
  - `runningAgentCount` and `errorAgentCount` memos
  - Collapsible Agents section with status icons/colors

### [🟢] 3.2 Add spawn agent command
- File: `packages/opencode/src/cli/cmd/tui/component/dialog-agent-spawn.tsx` (created)
- File: `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx` (modified)
- Added `/agent` slash command to spawn new agents
- Dialog prompts for agent title
- Makes direct fetch call to `/agent-process` endpoint

### [🟢] 3.3 Add agent switching in main panel
- Click on agent in sidebar navigates to that agent's session
- Uses `useRoute().navigate()` to switch sessions
- Each agent has its own session, so full session UI works

### [🟢] 3.4 Add agent actions menu
- File: `packages/opencode/src/cli/cmd/tui/component/dialog-agent-list.tsx` (created)
- File: `packages/opencode/src/cli/cmd/tui/component/dialog-agent-actions.tsx` (created)
- `/agents` slash command shows list of agents
- Selecting agent shows actions: Send prompt, Cancel, Stop
- Directly makes fetch calls to agent-process endpoints

---

## Phase 4: Session-Based Agent Implementation

### [🟢] 4.1 Refactor AgentProcess to use sessions
- Rewrote spawn() to create a new child Session instead of subprocess
- Link agent process to child session via sessionID and parentSessionID
- Forward prompts to session's prompt handler

### [🟢] 4.2 Implement status tracking
- Status updates via updateStatus() helper
- Maps to agent statuses: idle, working, error
- Emits Event.Updated on state changes

### [🟢] 4.3 Implement prompt forwarding
- sendPrompt() calls SessionPrompt.prompt() on the linked session
- cancel() calls SessionPrompt.cancel()
- Proper error handling with status updates

---

## Phase 5: SDK & Polish

### [🟢] 5.1 Regenerate SDK with agent-process types
- Ran `bun x @hey-api/openapi-ts` to generate SDK types
- Generated types include:
  - `EventAgentProcessCreated`, `EventAgentProcessUpdated`, `EventAgentProcessStopped`
  - `AgentProcessListData`, `AgentProcessSpawnData`, `AgentProcessSendPromptData`, etc.
- Generated SDK methods: `agentProcessList`, `agentProcessSpawn`, `agentProcessSendPrompt`, `agentProcessCancel`, `agentProcessStop`

### [🟢] 5.2 Replace raw API calls with SDK methods
- **Status**: Deferred - SDK v2 doesn't generate OpencodeClient class with nested methods
- Current implementation uses direct fetch() calls to /agent-process endpoints
- This works correctly and matches how the server routes are defined
- Future: Fix SDK generation to include agentProcess namespace in OpencodeClient

### [🟢] 5.3 Add keyboard shortcuts
- `/agent` - Slash command to spawn a new agent
- `/agents` - Slash command to list and manage agents
- Commands accessible via command palette (Ctrl+K or similar)

### [🟣] 5.4 Testing
- [🟢] Fixed runtime error: `undefined is not an object (evaluating 's.id')` at sync.tsx
  - Root cause: Binary.search didn't handle undefined array elements
  - Fix 1: Added defensive checks in `packages/util/src/binary.ts`
  - Fix 2: Added session.sync() before navigating in sidebar click handler
- [🟢] Fixed "Session not found" error when clicking agents
  - Root cause: fetch calls missing `x-opencode-directory` header
  - The server uses this header to determine project context for storage
  - Fix: Added `x-opencode-directory` header to all agent-related fetch calls
  - Updated: dialog-agent-spawn.tsx, dialog-agent-actions.tsx
- [ ] Test spawning multiple agents via `/agent` command
- [ ] Test parallel prompt execution across agents
- [ ] Test agent status tracking in sidebar
- [ ] Test clicking agent in sidebar to switch sessions
- [ ] Test `/agents` command to list and manage agents
- [ ] Test cancelling and stopping agents
- [ ] Test cleanup on exit (orphaned agents)

---

## Files Modified/Created

| File | Status | Description |
|------|--------|-------------|
| `src/id/id.ts` | 🟢 | Added "agent" prefix |
| `src/agent-process/index.ts` | 🟢 | Core module (session-based) |
| `src/server/routes/agent-process.ts` | 🟢 | Server routes |
| `src/server/server.ts` | 🟢 | Route already registered |
| `src/cli/cmd/tui/context/sync.tsx` | 🟢 | Sync store + event handlers |
| `src/cli/cmd/tui/routes/session/sidebar.tsx` | 🟢 | UI display + click to navigate + session sync |
| `src/cli/cmd/tui/routes/session/index.tsx` | 🟢 | Agent commands |
| `src/cli/cmd/tui/component/dialog-agent-spawn.tsx` | 🟢 | Spawn agent dialog |
| `src/cli/cmd/tui/component/dialog-agent-list.tsx` | 🟢 | List agents dialog |
| `src/cli/cmd/tui/component/dialog-agent-actions.tsx` | 🟢 | Agent actions dialog |
| `packages/util/src/binary.ts` | 🟢 | Defensive checks for undefined elements |

---

## Notes

- kild spawns native terminal windows (iTerm, Ghostty) - we embed agents in TUI instead
- opencode sessions already support one active prompt at a time
- Multiple sessions can run prompts in parallel - this is the key insight
- ~~The subprocess approach was over-engineered~~ Refactored to session-based approach
- Each agent is a child session of the parent session
- Agent processes appear in sidebar with status indicators
