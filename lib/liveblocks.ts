import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#E57373", // red
  "#64B5F6", // blue
  "#81C784", // green
  "#FFB74D", // orange
  "#BA68C8", // purple
  "#4DB6AC", // teal
  "#F06292", // pink
  "#A1887F", // brown
];

export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

let client: Liveblocks | null = null;

export function getLiveblocksClient(): Liveblocks {
  if (!client) {
    client = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY!,
    });
  }
  return client;
}
