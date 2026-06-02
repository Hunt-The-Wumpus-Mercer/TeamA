export const MapObjectType = {
    PLAYER: "player",
    WUMPUS: "wumpus",
    BAT_1: "bat1",
    BAT_2: "bat2",
    PIT_1: "pit1",
    PIT_2: "pit2",
} as const;

export interface HexRoomResult {
    roomAsset: string;
    rotationDegrees: number;
}

interface ObjectRooms {
        [name: string]: number;
    }
export let objectRoomNums: ObjectRooms = {
    player: -1,
    wumpus: -1,
    bat1: -1,
    bat2: -1,
    pit1: -1,
    pit2: -1
};

export const WumpusState = {
    SLEEPING: "sleeping",
    AWAKE: "awake",
    DEAD: "dead"
} as const;

export type WumpusState = (typeof WumpusState)[keyof typeof WumpusState];

export const Hazards = {
    WUMPUS: "wumpus",
    BAT: "bat",
    PIT: "pit"
} as const;

export type Hazards = (typeof Hazards)[keyof typeof Hazards];