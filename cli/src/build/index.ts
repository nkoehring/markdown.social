import fs from 'fs'
import { resolve } from 'path'
import parseFeed from 'plaintext-casa'
import { generateStaticSite } from './generator'

export interface BuildOptions {
  feedPath: string
  outputDir?: string
  templateDir?: string
}

/**
 * Generate static website from a feed
 */
export async function buildCommand(options: BuildOptions): Promise<void> {
  const absPath = resolve(options.feedPath)
  const outputDir = resolve(options.outputDir || './public')
  const templateDir = options.templateDir
    ? resolve(options.templateDir)
    : undefined

  if (!checkFileAccess(absPath)) {
    console.error('Cannot access feed at', absPath)
    process.exit(1)
  }

  console.log(`\nGenerating static pages from: ${options.feedPath}`)
  console.log(`Output directory: ${outputDir}`)
  if (templateDir) {
    console.log(`Template directory: ${templateDir}`)
  }

  try {
    // Read and parse the feed
    const rawFeed = await fs.promises.readFile(absPath, 'utf8')
    const fileFormat = options.feedPath.split('.').at(-1)
    const parsedFeed = parseFeed(rawFeed, fileFormat)

    // Generate the static site
    const result = await generateStaticSite(parsedFeed.feed, {
      feedPath: absPath,
      outputDir,
      templateDir,
    })

    console.log(`\n✓ Generated ${result.pagesGenerated} pages`)
    console.log(`✓ Created ${result.generatedFiles.length} files`)

    if (result.warnings.length > 0) {
      console.log('\nWarnings:')
      result.warnings.forEach((warning) => {
        console.log(`  ⚠️  ${warning}`)
      })
    }
  } catch (err) {
    console.error('Failed to generate static pages:', err)
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
