export const MapObjectType = {
    PLAYER: "player",
    WUMPUS: "wumpus",
    BAT1: "bat1",
    BAT2: "bat2",
    PIT1: "pit1",
    PIT2: "pit2",
} as const;

interface ObjectRooms {
        [name: string]: number;
    }
export const RoomNum: ObjectRooms = {
    PLAYER: -1,
    WUMPUS: -1,
    BAT1: -1,
    BAT2: -1,
    PIT1: -1,
    PIT2: -1
};

export type MapObjectType = (typeof MapObjectType)[keyof typeof MapObjectType];