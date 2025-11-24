export interface TextPart {
  type: 'text' | 'mention' | 'hashtag' | 'link';
  content: string;
  url?: string;
}

export function formatTextWithLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  // Regex patterns
  const mentionPattern = /@(\w+)/g;
  const hashtagPattern = /#(\w+)/g;
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  // Find all matches
  const matches: Array<{ type: 'mention' | 'hashtag' | 'link'; index: number; length: number; content: string; url?: string }> = [];

  let match;
  while ((match = mentionPattern.exec(text)) !== null) {
    matches.push({
      type: 'mention',
      index: match.index,
      length: match[0].length,
      content: match[0],
    });
  }

  while ((match = hashtagPattern.exec(text)) !== null) {
    matches.push({
      type: 'hashtag',
      index: match.index,
      length: match[0].length,
      content: match[0],
    });
  }

  while ((match = urlPattern.exec(text)) !== null) {
    matches.push({
      type: 'link',
      index: match.index,
      length: match[0].length,
      content: match[0],
      url: match[0],
    });
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Build parts
  for (const match of matches) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add match
    parts.push({
      type: match.type,
      content: match.content,
      url: match.url,
    });

    lastIndex = match.index + match.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}
