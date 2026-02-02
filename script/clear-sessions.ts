#!/usr/bin/env bun
/**
 * Clear all OpenCode sessions
 * 
 * This script deletes all sessions stored in OpenCode's storage directory.
 * Use with caution - this action cannot be undone!
 * 
 * After running this script, you MUST restart OpenCode for changes to take effect.
 */

import { xdgData } from "xdg-basedir"
import os from "os"
import fs from "fs/promises"
import path from "path"

async function clearAllSessions() {
  const app = "opencode"
  const home = process.env.OPENCODE_TEST_HOME || os.homedir()
  const dataDir = process.platform === "win32"
    ? path.join(home, ".local", "share", app)
    : (xdgData ? path.join(xdgData, app) : path.join(home, ".local", "share", app))
  const storageDir = path.join(dataDir, "storage")
  
  console.log("=".repeat(60))
  console.log("OpenCode Session Cleaner")
  console.log("=".repeat(60))
  console.log(`Home directory: ${home}`)
  console.log(`OpenCode data directory: ${dataDir}`)
  console.log(`Storage directory: ${storageDir}`)
  console.log("")
  
  // Check if storage directory exists
  try {
    await fs.access(storageDir)
    console.log("✅ Storage directory exists")
  } catch {
    console.log("❌ Storage directory does not exist:", storageDir)
    console.log("No sessions to delete.")
    return
  }
  
  try {
    // Use the same approach as getAllSessions() in stats.ts
    // First, list all projects from storage
    const projectsDir = path.join(storageDir, "project")
    console.log(`\nChecking projects directory: ${projectsDir}`)
    
    // List all projects - projects can be stored as:
    // 1. Directories: project/<projectId>/session/
    // 2. Metadata files: project/<projectId>.json
    let projectFiles: string[] = []
    try {
      projectFiles = await fs.readdir(projectsDir).catch(() => [])
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.log("❌ Projects directory does not exist")
        console.log("\nTrying to find project ID from current git repository...")
        
        // Try to calculate project ID from current directory's git root
        try {
          const { $ } = await import("bun")
          const gitRoot = await $`git rev-parse --show-toplevel`.quiet().text().catch(() => null)
          if (gitRoot) {
            const root = gitRoot.trim()
            console.log(`Git root: ${root}`)
            const projectId = await $`git rev-list --max-parents=0 --all`
              .quiet()
              .cwd(root)
              .text()
              .then(x => x.split("\n").filter(Boolean).map(x => x.trim()).toSorted()[0])
              .catch(() => null)
            
            if (projectId) {
              console.log(`Project ID: ${projectId}`)
              const sessionsDir = path.join(projectsDir, projectId, "session")
              console.log(`Checking: ${sessionsDir}`)
              
              try {
                const sessionFiles = await fs.readdir(sessionsDir)
                const jsonFiles = sessionFiles.filter(f => f.endsWith(".json"))
                console.log(`Found ${jsonFiles.length} session(s) for this project`)
                
                if (jsonFiles.length > 0) {
                  let deleted = 0
                  for (const file of jsonFiles) {
                    const sessionId = file.replace(".json", "")
                    const filePath = path.join(sessionsDir, file)
                    try {
                      await fs.unlink(filePath)
                      console.log(`  ✅ Deleted: ${sessionId}`)
                      deleted++
                    } catch (err: any) {
                      console.error(`  ❌ Failed: ${sessionId}`, err.message)
                    }
                  }
                  console.log(`\n✅ Deleted ${deleted} sessions`)
                  return
                }
              } catch {
                console.log("  (No sessions found for this project)")
              }
            }
          }
        } catch {
          // Git not available or not in a git repo
        }
        
        console.log("No sessions found.")
        return
      }
      console.log(`❌ Could not read projects directory:`, err.message)
      return
    }
    
    // Collect all project IDs from both directories and metadata files
    const projectIds = new Set<string>()
    
    for (const file of projectFiles) {
      const fullPath = path.join(projectsDir, file)
      try {
        const stat = await fs.stat(fullPath)
        if (stat.isDirectory()) {
          projectIds.add(file)
        } else if (file.endsWith(".json")) {
          projectIds.add(file.replace(".json", ""))
        }
      } catch {
        // Skip files we can't stat
      }
    }
    
    const projectIdArray = Array.from(projectIds)
    console.log(`Found ${projectIdArray.length} project(s)`)
    
    if (projectIdArray.length === 0) {
      console.log("\nNo projects found. Sessions might be stored elsewhere or already deleted.")
      console.log("Trying recursive scan...")
    }
    
    let totalDeleted = 0
    
    // For each project, check for sessions
    for (const projectId of projectIdArray) {
      const sessionsDir = path.join(projectsDir, projectId, "session")
      console.log(`\n📁 Project: ${projectId}`)
      console.log(`   Sessions dir: ${sessionsDir}`)
      
      try {
        const sessionFiles = await fs.readdir(sessionsDir)
        const jsonFiles = sessionFiles.filter(f => f.endsWith(".json"))
        
        console.log(`   Found ${jsonFiles.length} session file(s)`)
        
        if (jsonFiles.length === 0) {
          console.log("   (No session files to delete)")
          continue
        }
        
        for (const file of jsonFiles) {
          const sessionId = file.replace(".json", "")
          const filePath = path.join(sessionsDir, file)
          
          try {
            await fs.unlink(filePath)
            console.log(`   ✅ Deleted: ${sessionId}`)
            totalDeleted++
          } catch (err: any) {
            console.error(`   ❌ Failed to delete ${sessionId}:`, err.message)
          }
        }
      } catch (err: any) {
        if (err.code === "ENOENT") {
          console.log("   (Sessions directory doesn't exist)")
        } else {
          console.error(`   ❌ Error reading sessions directory:`, err.message)
        }
        continue
      }
    }
      
      // Also scan recursively for any session files that might be elsewhere
      console.log("\nScanning storage directory recursively for session files...")
      const foundSessionFiles: string[] = []
      
      async function scanForSessions(dir: string, depth = 0): Promise<void> {
        if (depth > 5) return // Prevent infinite recursion
        
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
              await scanForSessions(fullPath, depth + 1)
            } else if (entry.isFile() && entry.name.endsWith(".json")) {
              // Check if this looks like a session file (starts with "ses")
              try {
                const content = await Bun.file(fullPath).json().catch(() => null)
                if (content && content.id && typeof content.id === "string" && content.id.startsWith("ses")) {
                  foundSessionFiles.push(fullPath)
                }
              } catch {
                // Not a valid JSON or session file
              }
            }
          }
        } catch {
          // Can't read directory, skip
        }
      }
      
      await scanForSessions(storageDir)
      console.log(`Found ${foundSessionFiles.length} additional session file(s) via recursive scan`)
      
      // Delete found session files (that weren't already deleted)
      for (const filePath of foundSessionFiles) {
        try {
          const content = await Bun.file(filePath).json().catch(() => null)
          if (content && content.id) {
            // Check if we already deleted this one from a project directory
            const alreadyDeleted = projectIdArray.some(pid => filePath.includes(path.join(pid, "session")))
            if (!alreadyDeleted) {
              await fs.unlink(filePath)
              console.log(`   ✅ Deleted (from scan): ${content.id}`)
              totalDeleted++
            }
          }
        } catch (err: any) {
          console.error(`   ❌ Failed to delete ${filePath}:`, err.message)
        }
      }
    
    console.log(`\n${"=".repeat(60)}`)
    console.log(`✅ Deleted ${totalDeleted} sessions total`)
    console.log(`${"=".repeat(60)}`)
    
    // Also clear messages and parts for deleted sessions
    console.log("\nCleaning up orphaned messages and parts...")
    const messagesDir = path.join(storageDir, "message")
    const partsDir = path.join(storageDir, "part")
    
    let messagesDeleted = 0
    let partsDeleted = 0
    
    try {
      const messageDirs = await fs.readdir(messagesDir).catch(() => [])
      for (const msgDir of messageDirs) {
        const msgPath = path.join(messagesDir, msgDir)
        try {
          await fs.rm(msgPath, { recursive: true, force: true })
          messagesDeleted++
        } catch {}
      }
      console.log(`   Deleted ${messagesDeleted} message directory(ies)`)
    } catch {
      console.log("   (No messages directory)")
    }
    
    try {
      const partDirs = await fs.readdir(partsDir).catch(() => [])
      for (const partDir of partDirs) {
        const partPath = path.join(partsDir, partDir)
        try {
          await fs.rm(partPath, { recursive: true, force: true })
          partsDeleted++
        } catch {}
      }
      console.log(`   Deleted ${partsDeleted} part directory(ies)`)
    } catch {
      console.log("   (No parts directory)")
    }
    
    console.log("\n✅ Cleanup complete")
    console.log("\n⚠️  IMPORTANT: You must restart OpenCode for changes to take effect!")
    console.log("   The TUI may have cached sessions in memory.")
    
  } catch (err: any) {
    console.error("\n❌ Error clearing sessions:", err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

clearAllSessions()
