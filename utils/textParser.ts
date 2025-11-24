/**
 * Parse text for mentions (@username) and hashtags (#tag)
 */
export interface ParsedText {
  text: string;
  mentions: string[];
  hashtags: string[];
}

export function parseText(text: string): ParsedText {
  const mentions: string[] = [];
  const hashtags: string[] = [];

  // Find mentions (@username)
  const mentionRegex = /@(\w+)/g;
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  // Find hashtags (#tag)
  const hashtagRegex = /#(\w+)/g;
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }

  return {
    text,
    mentions,
    hashtags,
  };
}

/**
 * Convert text with mentions and hashtags to formatted string
 * Returns array of objects with type and content
 */
export interface TextPart {
  type: 'text' | 'mention' | 'hashtag';
  content: string;
}

export function formatTextWithLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const regex = /(@\w+|#\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add link
    const content = match[0];
    if (content.startsWith('@')) {
      parts.push({
        type: 'mention',
        content,
      });
    } else if (content.startsWith('#')) {
      parts.push({
        type: 'hashtag',
        content,
      });
    }

    lastIndex = match.index + match[0].length;
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

