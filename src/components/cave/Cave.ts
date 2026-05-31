import type { ICave } from "./ICave";
import Caves from "./Caves.json";

interface RoomData {
    type: string; // length == 6
    connected: number[] // 0 <= length <= 3
}

interface CaveData {
    roomCount: number;
    rooms: Record<number, RoomData>;
}

const cavesData: Record<string, unknown> = Caves;

export class Cave implements ICave {
    private rooms: Record<number, RoomData> = {};
    private roomCount: number = -1;

    loadCave(caveName: string): void {
        const caveData = cavesData[caveName] as CaveData;

        this.roomCount = caveData.roomCount;
        this.rooms = caveData.rooms;
    }

    getAvailableCaves(): string[] {
        return Object.keys(cavesData);
    }

    getRoomCount(): number {
        return this.roomCount;
    }

    private validateRoomNumber(roomNumber: number): void {
        if (roomNumber < 1 || roomNumber > this.roomCount) {
            throw new Error(`Room number '${roomNumber}' is out of bounds for room count '${this.roomCount}'.`);
        }
    }

    getConnectedRooms(roomNumber: number): number[] {
        this.validateRoomNumber(roomNumber);
        return this.rooms[roomNumber].connected;
    }
}

export function test_cave_files(): void {
    let cave: Cave = new Cave();
    cave.loadCave("cave1");
     
}