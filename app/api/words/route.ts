import { getReadingForLevel } from "../../../data/readings";
import { learningWords } from "../../../data/words";

export const dynamic = "force-static";

const words = learningWords.map((word) => ({
  ...word,
  reading: getReadingForLevel(word.level, word.meaning) ?? null,
}));

export function GET() {
  return Response.json(
    { words },
    {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
