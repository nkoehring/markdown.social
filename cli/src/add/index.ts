import fs from 'fs'
import { resolve } from 'path'

export interface AddOptions {
  feedPath: string
  client: string
}

/** Add a new post to a feed and open in editor */
export async function addCommand(options: AddOptions): Promise<void> {
  const absPath = resolve(options.feedPath)

  if (!checkFileAccess(absPath, fs.constants.W_OK)) {
    console.error('Cannot add post, because file is not writable!')
    process.exit(1)
  }

  try {
    // Generate RFC 3339 timestamp as ID
    const timestamp = new Date().toISOString()

    // Create new post with minimal metadata
    // Ensure proper spacing: newline then blank line, then post marker
    const newPost = `\n**\n:id: ${timestamp}\n:client: ${options.client}\n\nWrite here...\n`

    // Append to the feed file
    await fs.promises.appendFile(absPath, newPost, 'utf8')

    console.debug(`\nNew post added with ID: ${timestamp}`)

    // Get the editor from environment variables
    const editor = process.env.VISUAL || process.env.EDITOR || 'vi'
    console.debug(`Opening feed in editor: ${editor}`)

    // Open the file in the editor
    const { spawn } = await import('child_process')
    const editorProcess = spawn(editor, [absPath], {
      stdio: 'inherit',
    })

    editorProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error('\nEditor exited with code:', code)
        process.exit(1)
      }
    })
  } catch (err) {
    console.error('Failed to add post to feed at', absPath, err)
    process.exit(1)
  }
}

function checkFileAccess(absPath: string, mode = fs.constants.R_OK): boolean {
  try {
    fs.accessSync(absPath, mode)
    return true
  } catch {
    return false
  }
}
