#!/usr/bin/env bun
/**
 * Clear all OpenCode sessions via API
 * 
 * This script uses the OpenCode server API to delete all sessions.
 * It requires the OpenCode server to be running.
 * 
 * Use with caution - this action cannot be undone!
 */

import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"

async function clearAllSessionsViaAPI() {
  console.log("=".repeat(60))
  console.log("OpenCode Session Cleaner (via API)")
  console.log("=".repeat(60))
  
  // Try to connect to the server
  // Default server URL is http://localhost:4096
  // The TUI uses "http://opencode.internal" for direct RPC, but that requires a custom fetch
  const url = process.env.OPENCODE_URL || "http://localhost:4096"
  const directory = process.cwd()
  
  console.log(`Connecting to OpenCode server at: ${url}`)
  console.log(`Working directory: ${directory}`)
  console.log(`(Set OPENCODE_URL environment variable to use a different server URL)`)
  
  const client = createOpencodeClient({
    baseUrl: url,
    directory,
  })
  
  try {
    // List all sessions for the current directory
    console.log("\nFetching sessions from server...")
    const sessionsResponse = await client.session.list({
      directory,
    })
    const sessions = sessionsResponse.data ?? []
    
    console.log(`Found ${sessions.length} session(s)`)
    
    if (sessions.length === 0) {
      console.log("No sessions to delete.")
      return
    }
    
    // Delete each session
    let deleted = 0
    let failed = 0
    
    for (const session of sessions) {
      try {
        console.log(`\nDeleting session: ${session.id} (${session.title})`)
        await client.session.delete({
          sessionID: session.id,
          directory: session.directory,
        })
        console.log(`  ✅ Deleted: ${session.id}`)
        deleted++
      } catch (err: any) {
        console.error(`  ❌ Failed to delete ${session.id}:`, err.message)
        failed++
      }
    }
    
    console.log(`\n${"=".repeat(60)}`)
    console.log(`✅ Deleted ${deleted} sessions`)
    if (failed > 0) {
      console.log(`❌ Failed to delete ${failed} sessions`)
    }
    console.log(`${"=".repeat(60)}`)
    console.log(`\nNote: If you have the OpenCode TUI open, you may need to refresh`)
    console.log(`the session list (press the sessions command again) to see the changes.`)
    
  } catch (err: any) {
    console.error("\n❌ Error connecting to OpenCode server:", err.message)
    console.error("\nMake sure OpenCode is running and try again.")
    console.error("The OpenCode server should be running on http://localhost:4096")
    console.error("(or the URL specified in OPENCODE_URL environment variable)")
    console.error("\nAlternatively, run: bun run script/clear-sessions.ts (direct file deletion)")
    process.exit(1)
  }
}

clearAllSessionsViaAPI()
