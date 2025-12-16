import fs from 'fs'
import path from 'path'
import type { Feed, Post } from 'plaintext-casa'

export interface GeneratorOptions {
  /** Absolute path to the feed file */
  feedPath: string
  /** Absolute path to the output directory */
  outputDir: string
  /** Optional absolute path to custom templates directory */
  templateDir?: string
  /** Base URL for the site (optional, for absolute links) */
  baseUrl?: string
}

export interface GeneratorResult {
  /** Number of pages generated */
  pagesGenerated: number
  /** List of generated file paths */
  generatedFiles: string[]
  /** Any warnings during generation */
  warnings: string[]
}

/**
 * Generate static HTML pages from a plaintext.casa feed
 */
export async function generateStaticSite(
  feed: Feed,
  options: GeneratorOptions,
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    pagesGenerated: 0,
    generatedFiles: [],
    warnings: [],
  }

  // Ensure output directory exists
  // await fs.promises.mkdir(options.outputDir, { recursive: true })

  // TODO: Implement the following:
  // 1. Load or generate templates (index, post, feed pages)
  // 2. Generate index page with timeline
  // 3. Generate individual post pages
  // 4. Generate RSS/Atom feed (optional)
  // 5. Copy static assets (CSS, images, etc.)
  // 6. Handle followed feeds and external links

  result.warnings.push('Static site generation not yet implemented')

  return result
}

/**
 * Default HTML template for the index page
 */
export function getDefaultIndexTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>{{title}}</h1>
    {{#if description}}
    <p class="description">{{description}}</p>
    {{/if}}
  </header>
  <main>
    <div class="timeline">
      {{#each posts}}
      <article class="post">
        <header>
          {{#if title}}
          <h2><a href="{{url}}">{{title}}</a></h2>
          {{/if}}
          <time datetime="{{date}}">{{formattedDate}}</time>
        </header>
        <div class="content">
          {{{content}}}
        </div>
      </article>
      {{/each}}
    </div>
  </main>
  <footer>
    <p>Powered by <a href="https://plaintext.casa">plaintext.casa</a></p>
  </footer>
</body>
</html>`
}

/**
 * Default HTML template for individual post pages
 */
export function getDefaultPostTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - {{feedTitle}}</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <header>
    <nav><a href="../index.html">← Back to timeline</a></nav>
  </header>
  <main>
    <article class="post">
      <header>
        {{#if title}}
        <h1>{{title}}</h1>
        {{/if}}
        <time datetime="{{date}}">{{formattedDate}}</time>
      </header>
      <div class="content">
        {{{content}}}
      </div>
    </article>
  </main>
  <footer>
    <p>Powered by <a href="https://plaintext.casa">plaintext.casa</a></p>
  </footer>
</body>
</html>`
}

/**
 * Default CSS styles
 */
export function getDefaultStyles(): string {
  return `/* plaintext.casa default styles */
:root {
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'Courier New', monospace;
  --color-bg: #ffffff;
  --color-text: #333333;
  --color-link: #0066cc;
  --color-border: #e0e0e0;
  --spacing: 1rem;
}

* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing);
}

header {
  border-bottom: 1px solid var(--color-border);
  margin-bottom: calc(var(--spacing) * 2);
  padding-bottom: var(--spacing);
}

h1, h2, h3 {
  line-height: 1.2;
}

a {
  color: var(--color-link);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}

article.post {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: calc(var(--spacing) * 2);
}

article.post:last-child {
  border-bottom: none;
}

time {
  color: #666;
  font-size: 0.9rem;
}

pre {
  background: #f5f5f5;
  padding: var(--spacing);
  overflow-x: auto;
  border-radius: 4px;
}

code {
  font-family: var(--font-mono);
}

footer {
  margin-top: calc(var(--spacing) * 3);
  padding-top: var(--spacing);
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}`
}

/**
 * Load custom template from file or return default
 */
export async function loadTemplate(
  templateDir: string | undefined,
  templateName: string,
  defaultTemplate: string,
): Promise<string> {
  if (!templateDir) {
    return defaultTemplate
  }

  const templatePath = path.join(templateDir, templateName)

  try {
    const template = await fs.promises.readFile(templatePath, 'utf8')
    return template
  } catch {
    // Template not found, use default
    return defaultTemplate
  }
}

/**
 * Sanitize a string for use in a filename
 */
export function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200) // Limit length
}

/**
 * Generate a URL-friendly slug from a post
 */
export function generatePostSlug(post: Post): string {
  // Try to use date field first
  if (post.date) {
    return sanitizeFilename(post.date)
  }

  // Fall back to ID if it's not a date
  if (!post.id.match(/^\d{4}-\d{2}-\d{2}/)) {
    return sanitizeFilename(post.id)
  }

  // Use ID if it looks like a date
  return sanitizeFilename(post.id)
}
