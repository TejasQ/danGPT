export function replaceTwitterHandles(text: string): string {
  // Regex to match Twitter handles: starts with @ followed by one or more word characters or underscores
  const regex = /@([a-zA-Z0-9_]+)/g;

  // Replace matched handles with Markdown links
  return text.replace(
    regex,
    (match, handle) => `[${match}](https://twitter.com/${handle})`
  );
}
