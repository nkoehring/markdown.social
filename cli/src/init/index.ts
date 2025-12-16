import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { parse, stringify } from 'smol-toml'
import envPaths from 'env-paths'

export interface Config {
  /** Default feed path */
  feed: string
  /** Config version. */
  version: '1'
}

const paths = envPaths('casa', { suffix: '' })
const configPath = resolve(paths.config, 'config.toml')

function isValidConfig(data: any): data is Config {
  return typeof data?.feed === 'string'
}

/** Initialize configuration */
export function initCommand(
  initialConfig: Partial<Omit<Config, 'version'>>,
): void {
  // Check if config already exists
  if (existsSync(configPath)) {
    console.error(`Config file already exists at: ${configPath}`)
    process.exit(1)
  }

  // Get feed path
  let feedPath = initialConfig.feed
  if (!feedPath) {
    console.warn('\n⚠️  Interactive config creation not yet implemented.')
    console.warn('Usage: casa init <feed-path>\n')
    process.exit(1)
  }

  const absPath = resolve(feedPath)

  // Verify feed exists
  if (!existsSync(absPath)) {
    console.error(`Feed file does not exist: ${absPath}`)
    process.exit(1)
  }

  // Create config file
  const config = {
    feed: absPath,
    version: '1',
  }

  try {
    mkdirSync(paths.config, { recursive: true })
    writeFileSync(configPath, stringify(config), 'utf8')
    console.log(`\n✓ Created config file: ${configPath}`)
    console.log(`✓ Default feed: ${absPath}\n`)
  } catch (err) {
    console.error('Failed to create config file:', err)
    process.exit(1)
  }
}

/** Load configuration */
export function loadConfig(): Config | null {
  if (!existsSync(configPath)) return null

  try {
    const configContent = readFileSync(configPath, 'utf8')
    const data = parse(configContent)
    if (isValidConfig(data)) return data
    console.warn('\n⚠️  Invalid config file!')
  } catch (err) {
    console.error('Failed to load config file:', err)
  }
  return null
}
