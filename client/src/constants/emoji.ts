export const EMOJI_OPTIONS = [
  { key: "LIKE", emoji: "👍", label: "좋아요" },
  { key: "LOVE", emoji: "❤️", label: "최고예요" },
  { key: "HAHA", emoji: "😂", label: "웃겨요" },
  { key: "WOW", emoji: "😮", label: "놀라워요" },
  { key: "SAD", emoji: "😢", label: "슬퍼요" },
  { key: "CLAP", emoji: "👏", label: "응원해요" },
] as const;

export type EmojiKey = (typeof EMOJI_OPTIONS)[number]["key"];
