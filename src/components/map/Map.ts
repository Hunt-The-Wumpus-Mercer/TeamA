import { Cave } from "../cave/Cave";
import type { ICave } from "../cave/ICave";
import { type MapObjectType, objectRoomNums } from "./IMap";
import { CaveRoomDirections } from "../shared/CaveRoomDirections";
import { Player } from "../player/Player";


const hazardNames: string[] = [
    "wumpus",
    "bat1",
    "bat2",
    "pit1",
    "pit2"
];

const wumpusWarnings: string[] = [
    "You smell something terrible and monstrous nearby.",
    "A low, rumbling growl vibrates through the stone floor.",
    "The air feels heavy, hot, and thick with the scent of blood."
];

const batWarnings: string[] = [
    "You hear a faint, chaotic fluttering of wings nearby.",
    "High-pitched squeaks echo from a tunnel just ahead.",
    "A sudden draft of air brushes past your face, smelling of guano."
];

const pitWarnings: string[] = [
    "A cold, damp breeze blows up from the darkness ahead.",
    "You hear the faint sound of pebbles crumbling and falling into an endless void.",
    "The ground slopes slightly downward, and the air smells of old earth."
];
        
export class Map
{
    public cave: ICave;
    public player: Player;
    public wumpusState: string;

    constructor(cave: Cave, player: Player) {
        this.cave = cave;
        this.player = player;
        this.wumpusState = "sleeping";
    }
    
    /**
    * Initializes the helper with cave and map dependencies,
    * including random map object placement.
     */
    public static initialize(cave: Cave): void {
        cave.loadCave("cave1");
        return;
    }

    movePlayer(direction: string): number {
        const directionsOrder = [
            CaveRoomDirections.NORTH,
            CaveRoomDirections.NORTH_EAST,
            CaveRoomDirections.SOUTH_EAST,
            CaveRoomDirections.SOUTH,
            CaveRoomDirections.SOUTH_WEST,
            CaveRoomDirections.NORTH_WEST
        ];
        
        this.player.decrementResource("arrows");

        const playerRoom: number = Map.getRoomLocation("player");
        const adjacentRooms: number[] = this.cave.getAdjacentRooms(playerRoom);
        const dirIndex: number = directionsOrder.indexOf(direction);
        if (dirIndex === -1) throw new Error(`Invalid cave direction '${direction}'`);
        else {
            Map.setRoomLocation("player", adjacentRooms[dirIndex]);
            return adjacentRooms[dirIndex];
        }
    }

    /**
     * Returns hazards in the player's current room.
     * Hazard names are "wumpus", "bat", and "pit".
     * If wumpus is present, it appears first in the result.
     */
    public getHazardsInPlayerRoom(): string[] {
        const hazards: string[] = []
        const hazardRoomNums: number[] = [
            Map.getRoomLocation("wumpus"),
            Map.getRoomLocation("bat1"),
            Map.getRoomLocation("bat2"),
            Map.getRoomLocation("pit1"),
            Map.getRoomLocation("pit2")
        ];
        const playerRoom: number =  Map.getRoomLocation("player")
        for (let i = 0; i < hazardRoomNums.length; i++) {
            if (playerRoom == hazardRoomNums[i]) {
                switch(hazardNames[i]) {
                    case 'wumpus': hazards.push(wumpusWarnings[Math.floor(Math.random() * wumpusWarnings.length)]); break;
                    case 'bat1':
                    case 'bat2': hazards.push(batWarnings[Math.floor(Math.random() * batWarnings.length)]); break;
                    case 'pit1':
                    case 'pit2': hazards.push(pitWarnings[Math.floor(Math.random() * pitWarnings.length)]); break;
                }
            }

        }
        return hazards;
    }

    /**
     * Returns warning messages for hazards in rooms adjacent to the player.
     * Warning messages are unique and random out of 3 possible.
     */
    getWarningsNearPlayer(): string[] {
        const hazards: string[] = []
        const hazardRoomNums: number[] = [
            Map.getRoomLocation("wumpus"),
            Map.getRoomLocation("bat1"),
            Map.getRoomLocation("bat2"),
            Map.getRoomLocation("pit1"),
            Map.getRoomLocation("pit2")
        ];
        
        const playerRoom: number =  Map.getRoomLocation("player")
        for (let i = 0; i < hazardRoomNums.length; i++) {
            const adjacentRooms: number[] = this.cave.getAdjacentRooms(playerRoom);
            // if any adjacent room contains this hazard, add its warning
            if (adjacentRooms.includes(hazardRoomNums[i])) {
                hazards.push(hazardNames[i]);
            }
        }
        return hazards;
    }

     /**
     * Returns the room location for the requested map object.
     */
    public static getRoomLocation(type: string): number {
        return objectRoomNums[type as MapObjectType];
    }

    /**
     * Sets the room location for the requested map object.
     */
    public static setRoomLocation(type: string, roomNumber: number): void {
        objectRoomNums[type as MapObjectType] = roomNumber;
        return;
    }

    /**
     * Moves the wumpus after a missed shot to a room up to two moves away.
     * Returns the new room number.
     */
    moveWumpusAfterMiss(): number {
        let adjacentRooms: number[] = this.cave.getAdjacentRooms(Map.getRoomLocation("wumpus"));
        let roomToTravel: number = adjacentRooms[Math.floor(Math.random() * adjacentRooms.length)];
        Map.setRoomLocation("wumpus", roomToTravel);
        adjacentRooms = this.cave.getAdjacentRooms(Map.getRoomLocation("wumpus"));
        roomToTravel = adjacentRooms[Math.floor(Math.random() * adjacentRooms.length)];
        Map.setRoomLocation("wumpus", roomToTravel);
        return Map.getRoomLocation("wumpus");
    }


    /**
     * Moves the player to a random room after a bat encounter.
     * Returns the new room number.
     */
    movePlayerAfterBatEncounter(excludedRooms?: number[]): number {
        if (!excludedRooms) excludedRooms = [];
        let roomToGoTo: number = -1;
        while (!excludedRooms.includes(roomToGoTo) && roomToGoTo != -1) {
            roomToGoTo = Math.floor(Math.random() * this.cave.getRoomCount()) + 1
        }
        Map.setRoomLocation("player", roomToGoTo);
        return 0;
    }

    /**
     * Simulates firing an arrow in the given direction. (e.g. "north_east")
     * Automatically moves wumpus if the player misses.
     * Returns -1 if fired out of bounds, otherwise the room fired into.
     */
    fireArrow(direction: string): boolean | number {
        const directionsOrder = [
            CaveRoomDirections.NORTH,
            CaveRoomDirections.NORTH_EAST,
            CaveRoomDirections.SOUTH_EAST,
            CaveRoomDirections.SOUTH,
            CaveRoomDirections.SOUTH_WEST,
            CaveRoomDirections.NORTH_WEST
        ];
        
        this.player.decrementResource("arrows");

        const playerRoom: number = Map.getRoomLocation("player");
        const adjacentRooms: number[] = this.cave.getAdjacentRooms(playerRoom);
        const dirIndex: number = directionsOrder.indexOf(direction);
        if (dirIndex === -1) throw new Error(`Invalid cave direction '${direction}'`);

        const targetRoom: number = adjacentRooms[dirIndex];
        if (!targetRoom || targetRoom <= 0) return -1;

        const wumpusRoom: number = Map.getRoomLocation("wumpus");
        if (targetRoom === wumpusRoom) {
            this.wumpusState = "dead"
            return true;
        } else {
            this.moveWumpusAfterMiss();
            return targetRoom;
        }
    }

    /**
     * Simulates the wumpus. 
     * Returns and sets the room of the wumpus to
     * -1 if the wumpus is dead.
     * If the wumpus is sleeping, it wont move.
     * Awakens the wumpus if the player is adjacent.
     * Returns the room the wumpus ended up in.
     */
    simWumpus(): number {
        // move the wumpus if awake
        const adjacentRooms: number[] = this.cave.getAdjacentRooms(Map.getRoomLocation("wumpus"));
        if (this.wumpusState == "awake") {
            Map.setRoomLocation("wumpus", adjacentRooms[Math.floor(Math.random() * adjacentRooms.length)]);
        }
        else if (this.wumpusState == "sleeping") {
            if (adjacentRooms.includes(Map.getRoomLocation("player")))
                this.wumpusState = "awake";
        }
        else Map.setRoomLocation("wumpus", -1);

        return Map.getRoomLocation("wumpus");
    }
}