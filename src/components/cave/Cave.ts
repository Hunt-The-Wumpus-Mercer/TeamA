import type { ICave } from "./ICave";

interface RoomData {
    adjacent: number[]; // length == 6
    connected: number[] // 0 < length <= 3 
}

interface CaveData {
    name: string;
    roomCount: number;
    rooms: Record<number, RoomData>;
}

export class Cave implements ICave {
    // Placeholder for the caves directory
    private static CAVES_DIR: string = "./caves";

    // Array of the available cave files names
    private static AVAILABLE_CAVES_PATHS: string[] = [
        `${Cave.CAVES_DIR}/cave1.json`
        // TODO: Add available caves
    ];

    private rooms: Record<number, RoomData> = {};
    private roomCount: number = 0;

    async loadCave(caveName: string): Promise<void> {
        const cavePath = `${Cave.CAVES_DIR}/${caveName}.json`;

        try {
            // Fetches the cave data from the available cave Json file
            const caveData = await $.getJSON(cavePath) as CaveData;

            this.roomCount = caveData.roomCount;
            this.rooms = caveData.rooms;
        } catch (error) {
            throw new Error(`Failed to load cave from file path '${cavePath}'.`);
        }
    }

    getAvailableCaves(): string[] {
        return Cave.AVAILABLE_CAVES_PATHS;
    }

    getRoomCount(): number {
        return this.roomCount;
    }

    private validateRoomNumber(roomNumber: number): void {
        if (roomNumber < 1 || roomNumber > this.roomCount) {
            throw new Error(`Room number '${roomNumber}' is out of bounds for room count '${this.roomCount}'.`);
        }
    }

    getAdjacentRooms(roomNumber: number): number[] {
        this.validateRoomNumber(roomNumber);
        return this.rooms[roomNumber].adjacent;
    }

    getConnectedRooms(roomNumber: number): number[] {
        this.validateRoomNumber(roomNumber);
        return this.rooms[roomNumber].connected;
    }
}