/**
 * Monkey-patches globalThis.fetch to sanitize Anthropic API requests.
 * Removes empty text content blocks that cause:
 *   "text content blocks must be non-empty"
 *   "cache_control cannot be set for empty text blocks"
 *
 * Loaded via --require in the Claude Code subprocess.
 */
const originalFetch = globalThis.fetch;

globalThis.fetch = async function patchedFetch(url, options) {
  if (
    typeof url === 'string'
    && url.includes('anthropic.com')
    && options?.method === 'POST'
    && options.body
  ) {
    try {
      const body = JSON.parse(options.body);
      let modified = false;

      // Remove empty text blocks from system prompt
      if (Array.isArray(body.system)) {
        const filtered = body.system.filter(
          (b) => !(b.type === 'text' && !b.text),
        );
        if (filtered.length !== body.system.length) {
          body.system = filtered;
          modified = true;
        }
      }

      // Remove empty text blocks from messages and fix empty content
      if (Array.isArray(body.messages)) {
        for (const msg of body.messages) {
          // Handle empty string content
          if (typeof msg.content === 'string' && !msg.content.trim()) {
            msg.content = '...';
            modified = true;
          }
          // Handle content arrays
          if (Array.isArray(msg.content)) {
            const filtered = msg.content.filter(
              (b) => !(b.type === 'text' && !b.text),
            );
            if (filtered.length !== msg.content.length) {
              // If array would be empty after filtering, keep a placeholder
              msg.content = filtered.length > 0
                ? filtered
                : [{ type: 'text', text: '...' }];
              modified = true;
            }
          }
        }
      }

      if (modified) {
        options = { ...options, body: JSON.stringify(body) };
      }
    } catch {
      // If JSON parse fails, forward as-is
    }
  }

  return originalFetch.call(this, url, options);
};
