export const PlayerResourceType = {
    ARROWS: 0,
    COINS: 0,
    TURNS: 0
} as const;

export type PlayerResourceType = (typeof PlayerResourceType)[keyof typeof PlayerResourceType];
