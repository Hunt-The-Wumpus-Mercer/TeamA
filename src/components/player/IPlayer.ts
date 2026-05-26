export const PlayerResourceType = {
    ARROWS: "arrows",
    COINS: "coins",
    TURNS: "turns",
} as const;

export type PlayerResourceType = (typeof PlayerResourceType)[keyof typeof PlayerResourceType];
