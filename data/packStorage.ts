import {
  createGodPackCards,
  createTenPackCards,
  EarnedCard,
  getOwnedCount,
  MonsterCard,
  pickCardByRarity,
  rollGodPack,
} from "./cards";

export type StoredEarnedCard = EarnedCard & {
  cardId: string;
  correctCount: number;
  exp: number;
  obtainedAt: string;
  updatedAt?: string;
  ownedCount?: number;
};

export type PackOpenMode = "single" | "ten";

export type PackOpenItem = {
  card: MonsterCard;
  isNew: boolean;
  ownedCopies: number;
};

export type StoredPackOpenResult = {
  mode: PackOpenMode;
  isGodPack: boolean;
  items: {
    cardId: string;
    isNew: boolean;
    ownedCopies: number;
  }[];
  openedAt: string;
};

export function loadPackTickets(): number {
  if (typeof window === "undefined") return 0;

  const value = Number(localStorage.getItem("packTickets") ?? "0");
  return Number.isFinite(value) ? value : 0;
}

export function savePackTickets(value: number) {
  localStorage.setItem("packTickets", String(Math.max(0, Math.floor(value))));
}

export function loadEarnedCards(): StoredEarnedCard[] {
  if (typeof window === "undefined") return [];

  try {
    const savedCardsText = localStorage.getItem("earnedCards");
    const parsedCards = savedCardsText ? JSON.parse(savedCardsText) : [];

    if (!Array.isArray(parsedCards)) return [];

    return parsedCards.filter((card) => {
      return typeof card.cardId === "string";
    });
  } catch {
    localStorage.removeItem("earnedCards");
    return [];
  }
}

export function saveEarnedCards(cards: StoredEarnedCard[]) {
  localStorage.setItem("earnedCards", JSON.stringify(cards));
}

export function upsertEarnedCard(
  earnedCards: StoredEarnedCard[],
  card: MonsterCard
): {
  nextEarnedCards: StoredEarnedCard[];
  isNewCard: boolean;
  ownedCopies: number;
} {
  const now = new Date().toISOString();
  const existingCard = earnedCards.find((earnedCard) => earnedCard.cardId === card.id);

  if (!existingCard) {
    const newEarnedCard: StoredEarnedCard = {
      cardId: card.id,
      correctCount: 0,
      exp: 0,
      obtainedAt: now,
      updatedAt: now,
      ownedCount: 1,
    } as StoredEarnedCard;

    return {
      nextEarnedCards: [...earnedCards, newEarnedCard],
      isNewCard: true,
      ownedCopies: 1,
    };
  }

  const currentOwnedCount = getOwnedCount(existingCard);
  const nextOwnedCount = currentOwnedCount + 1;

  const nextEarnedCards = earnedCards.map((earnedCard) => {
    if (earnedCard.cardId !== card.id) return earnedCard;

    return {
      ...earnedCard,
      ownedCount: nextOwnedCount,
      updatedAt: now,
    };
  });

  return {
    nextEarnedCards,
    isNewCard: false,
    ownedCopies: nextOwnedCount,
  };
}

export function consumeForcedGodPack(): boolean {
  if (typeof window === "undefined") return false;

  const shouldForce = localStorage.getItem("forceGodPackOnce") === "1";
  if (shouldForce) localStorage.removeItem("forceGodPackOnce");
  return shouldForce;
}

export function queueForcedGodPack() {
  localStorage.setItem("forceGodPackOnce", "1");
}

export function openStoredPack(mode: PackOpenMode): {
  ok: boolean;
  reason?: "tickets";
  isGodPack: boolean;
  items: PackOpenItem[];
  remainingTickets: number;
} {
  const ticketCost = mode === "ten" ? 10 : 1;
  const currentTickets = loadPackTickets();

  if (currentTickets < ticketCost) {
    return {
      ok: false,
      reason: "tickets",
      isGodPack: false,
      items: [],
      remainingTickets: currentTickets,
    };
  }

  const shouldForceGodPack = mode === "ten" && consumeForcedGodPack();
  const isGodPack = shouldForceGodPack || rollGodPack();
  const cards = isGodPack
    ? createGodPackCards()
    : mode === "ten"
      ? createTenPackCards()
      : [pickCardByRarity()];

  let currentEarnedCards = loadEarnedCards();
  const items: PackOpenItem[] = [];

  for (const card of cards) {
    const result = upsertEarnedCard(currentEarnedCards, card);
    currentEarnedCards = result.nextEarnedCards;
    items.push({
      card,
      isNew: result.isNewCard,
      ownedCopies: result.ownedCopies,
    });
  }

  const remainingTickets = currentTickets - ticketCost;
  savePackTickets(remainingTickets);
  saveEarnedCards(currentEarnedCards);

  return {
    ok: true,
    isGodPack,
    items,
    remainingTickets,
  };
}

export function saveLastPackOpenResult(
  mode: PackOpenMode,
  isGodPack: boolean,
  items: PackOpenItem[]
) {
  const result: StoredPackOpenResult = {
    mode,
    isGodPack,
    items: items.map((item) => ({
      cardId: item.card.id,
      isNew: item.isNew,
      ownedCopies: item.ownedCopies,
    })),
    openedAt: new Date().toISOString(),
  };

  localStorage.setItem("lastPackOpenResult", JSON.stringify(result));
}

export function loadLastPackOpenResult(): StoredPackOpenResult | null {
  if (typeof window === "undefined") return null;

  try {
    const text = localStorage.getItem("lastPackOpenResult");
    if (!text) return null;

    const parsed = JSON.parse(text) as StoredPackOpenResult;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    if (parsed.mode !== "single" && parsed.mode !== "ten") return null;

    return parsed;
  } catch {
    localStorage.removeItem("lastPackOpenResult");
    return null;
  }
}

export function clearLastPackOpenResult() {
  localStorage.removeItem("lastPackOpenResult");
}
