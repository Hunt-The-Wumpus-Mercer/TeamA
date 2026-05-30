export const MapObjectType = {
    player: "player",
    wumpus: "wumpus",
    bat1: "bat1",
    bat2: "bat2",
    pit1: "pit1",
    pit2: "pit2",
} as const;

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

export type MapObjectType = (typeof MapObjectType)[keyof typeof MapObjectType];