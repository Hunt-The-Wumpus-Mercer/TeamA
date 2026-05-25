export interface ICave {
    // Using template interface
    // BTW: Cave files are Json objects of the format: 
    /* 
    {
        "name": "Cave Name",
        "roomCount": 3,
        "rooms": {
            "1": {
              "adjacent": [0, 2, 3, 0, 0, 0],
              "connected": [0, 2, 0, 0, 0, 0]
            },
            "2": {
              "adjacent": [1, 0, 0, 0, 0, 0],
              "connected": [1, 0, 0, 0, 0, 0]
            },
            "3": {
              "adjacent": [1, 0, 0, 0, 0, 0],
              "connected": [0, 0, 0, 0, 0, 0]
            }
        }
    }
    */  

    /**
    * Loads cave data from one of the available cave files.
    * Rooms are numbered from 1..N.
    * A value of 0 means there is no adjacent room/connection for that side.
     */
    loadCave(caveName: string): Promise<void>;

    /**
     * Returns the list of cave file paths that can be loaded.
     */
    getAvailableCaves(): string[];

    /**
     * Returns the number of rooms in the currently loaded cave.
     */
    getRoomCount(): number;

    /**
     * Returns six adjacent room entries for the given room.
     * Each value is a room number in the range 1..N, or 0 when no adjacent room exists.
     */
    getAdjacentRooms(roomNumber: number): number[];

    /**
     * Returns six connected room entries for the given room,
     * using 0 where no doorway connection exists.
     */
    getConnectedRooms(roomNumber: number): number[];
}