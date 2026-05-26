export const MapObjectType = {
    PLAYER: "player",
    WUMPUS: "wumpus",
    BAT1: "bat1",
    BAT2: "bat2",
    PIT1: "pit1",
    PIT2: "pit2",
} as const;

export type MapObjectType = (typeof MapObjectType)[keyof typeof MapObjectType];