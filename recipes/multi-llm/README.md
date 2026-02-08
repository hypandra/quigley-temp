# Multi-LLM Orchestration Recipe

This recipe extracts a reusable orchestration pattern for multi-step LLM workflows:

1. Query planning (LLM generates search objective + queries)
2. Web search (Parallel)
3. Summarization (LLM synthesizes sources)

It uses OpenRouter for LLM calls and Parallel for search extraction.

## Files

- `src/orchestrator.ts` — main orchestration logic (query → search → summarize)
- `src/context.ts` — reusable context summary builder
- `src/prompts.ts` — prompt templates for planning + summarization
- `src/types.ts` — shared types
- `example/api/orchestrate/route.ts` — Next.js API route example

## Environment Variables

- `OPENROUTER_API_KEY` (required)
- `OPENROUTER_MODEL` (optional, defaults to `anthropic/claude-3.5-haiku`)
- `OPENROUTER_SITE_URL` (optional)
- `OPENROUTER_APP_NAME` (optional)
- `PARALLEL_API_KEY` (required)

## Parallel Web Usage

The orchestrator uses `parallel-web` with the beta search extraction API:

- `client.beta.search({ objective, search_queries, max_results, max_chars_per_result, depth: 'snippets' }, { headers: { 'parallel-beta': 'search-extract-2025-10-10' } })`

If you change the beta header version, update `parallelBetaHeader` in `src/orchestrator.ts` or pass a custom header via config.

## Example Request

POST body to `example/api/orchestrate/route.ts`:

```json
{
  "messages": [{ "role": "user", "content": "Find research on note-taking systems for writers." }],
  "context": {
    "document": {
      "id": "doc_1",
      "title": "Idea draft",
      "content": "I want to compare Zettelkasten and Evergreen notes."
    }
  }
}
```

The response includes the plan, raw search results, and summary package.

## Notes

- The orchestration helpers are intentionally provider-agnostic in naming; swap the LLM provider by replacing `openRouterChat`.
- `buildContextSummary` is reusable for any workflow that needs a short context string passed into the LLM.
