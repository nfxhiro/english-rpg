import { monsterCards } from "../../../data/cards";
import CardDetailClient from "./CardDetailClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return monsterCards.map((card) => ({
    word: card.id,
  }));
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ word: string }>;
}) {
  const { word } = await params;

  return <CardDetailClient cardId={decodeURIComponent(word)} />;
}
