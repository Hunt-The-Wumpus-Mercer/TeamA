import { Cave } from "../cave/Cave";
import type { ICave } from "../cave/ICave";
import { type MapObjectType, objectRoomNums } from "./IMap";
import { CaveRoomDirections } from "../shared/CaveRoomDirections";
import { PlayerResources } from "../player/IPlayer";


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

    constructor(cave: Cave) {
        this.cave = cave;
    }
    
    /**
    * Initializes the helper with cave and map dependencies,
    * including random map object placement.
     */
    public static initialize(cave: Cave): void {
        cave.loadCave("cave1");
        return;
    }

    /**
     * Returns hazards in the player's current room.
     * Hazard names are "wumpus", "bat", and "pit".
     * If wumpus is present, it appears first in the result.
     */
    public getHazardsInPlayerRoom(): string[] {
        const hazards: string[] = []
        const hazardRoomNums: number[] = [
            this.getRoomLocation("wumpus" as MapObjectType),
            this.getRoomLocation("bat1" as MapObjectType),
            this.getRoomLocation("bat2" as MapObjectType),
            this.getRoomLocation("pit1" as MapObjectType),
            this.getRoomLocation("pit2" as MapObjectType)
        ];
        const playerRoom: number =  this.getRoomLocation("player" as MapObjectType)
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
            this.getRoomLocation("wumpus" as MapObjectType),
            this.getRoomLocation("bat1" as MapObjectType),
            this.getRoomLocation("bat2" as MapObjectType),
            this.getRoomLocation("pit1" as MapObjectType),
            this.getRoomLocation("pit2" as MapObjectType)
        ];
        
        const playerRoom: number =  this.getRoomLocation("player" as MapObjectType)
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
    getRoomLocation(type: MapObjectType): number {
        return objectRoomNums[type];
    }

    /**
     * Sets the room location for the requested map object.
     */
    setRoomLocation(type: string, roomNumber: number): void {
        objectRoomNums[type as MapObjectType] = roomNumber;
        return;
    }

    /**
     * Moves the wumpus after a missed shot to a room up to two moves away.
     * Returns the new room number.
     */
    moveWumpusAfterMiss(): number {
        let adjacentRooms: number[] = this.cave.getAdjacentRooms(this.getRoomLocation("wumpus" as MapObjectType));
        let roomToTravel: number = adjacentRooms[Math.floor(Math.random() * adjacentRooms.length)];
        this.setRoomLocation("wumpus", roomToTravel);
        adjacentRooms = this.cave.getAdjacentRooms(this.getRoomLocation("wumpus" as MapObjectType));
        roomToTravel = adjacentRooms[Math.floor(Math.random() * adjacentRooms.length)];
        this.setRoomLocation("wumpus", roomToTravel);
        return this.getRoomLocation("wumpus" as MapObjectType);
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
        this.setRoomLocation("player", roomToGoTo);
        return 0;
    }


    fireArrow(direction: CaveRoomDirections): number {
        const directionsOrder = [
            CaveRoomDirections.NORTH,
            CaveRoomDirections.NORTHEAST,
            CaveRoomDirections.SOUTHEAST,
            CaveRoomDirections.SOUTH,
            CaveRoomDirections.SOUTHWEST,
            CaveRoomDirections.NORTHWEST
        ];



        const playerRoom: number = this.getRoomLocation("player" as MapObjectType);
        const adjacentRooms: number[] = this.cave.getAdjacentRooms(playerRoom);
        const dirIndex: number = directionsOrder.indexOf(direction);
        if (dirIndex === -1) throw new Error(`Invalid cave direction '${direction}'`);

        const targetRoom: number = adjacentRooms[dirIndex];
        if (!targetRoom || targetRoom <= 0) return -1;

        const wumpusRoom: number = this.getRoomLocation("wumpus" as MapObjectType);
        if (targetRoom === wumpusRoom) {
            this.setRoomLocation("wumpus", -1);
            return targetRoom;
        }

        this.moveWumpusAfterMiss();
        return targetRoom;
    }
}