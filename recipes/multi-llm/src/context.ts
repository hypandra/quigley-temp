import type { OrchestrationContext } from './types'

const MAX_SNIPPET_LENGTH = 1600
const MAX_NODES = 12
const MAX_IMAGES = 8

const truncate = (value: string, max = MAX_SNIPPET_LENGTH) => {
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
}

export function buildContextSummary(context?: OrchestrationContext | null) {
  if (!context) {
    return 'Context: The user has not provided any working material yet. Respond to their latest message without assuming hidden context.'
  }

  const hasDocument = !!context.document?.content?.trim()
  const hasCanvas = context.canvas && context.canvas.nodes.length > 0
  const hasImages = context.images && context.images.length > 0

  if (!hasDocument && !hasCanvas && !hasImages) {
    return 'Context: The user has not provided any working material yet. They may be on a blank page or overview. Respond to what they say without assuming more.'
  }

  const lines: string[] = ['Context from the user\'s workspace:']

  if (context.document) {
    lines.push(`- Document title: "${context.document.title}"`)
    const content = context.document.content?.trim()
    if (content) {
      lines.push(`- Document content:\n${truncate(content)}`)
    } else {
      lines.push('- Document content: (empty or blank)')
    }
  }

  if (context.canvas) {
    lines.push(`- Canvas: "${context.canvas.title}"`)
    const nodes = context.canvas.nodes.slice(0, MAX_NODES)
    if (nodes.length > 0) {
      lines.push(
        `- Canvas nodes: ${nodes.map((node) => {
          const detail = node.content ? ` — ${truncate(node.content, 240)}` : ''
          return `${node.label}${detail}`
        }).join(' | ')}`
      )
    }
    const edges = context.canvas.edges.slice(0, MAX_NODES)
    if (edges.length > 0) {
      lines.push(
        `- Canvas edges: ${edges.map((edge) => {
          return `${edge.source} -> ${edge.target}${edge.label ? ` (${edge.label})` : ''}`
        }).join(' | ')}`
      )
    }
  }

  if (hasImages) {
    const images = context.images!.slice(0, MAX_IMAGES)
    lines.push(
      `- Generated images based on: ${images.map((image) => truncate(image.sourceText, 120)).join(' | ')}`
    )
  }

  return lines.join('\n')
}
