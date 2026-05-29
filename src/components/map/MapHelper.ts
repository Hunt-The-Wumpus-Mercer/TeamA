import { Cave } from "../cave/Cave";
import type { ICave } from "../cave/ICave";
import type { MapObjectType } from "./IMap";
import { Map } from "./Map";

const cave: ICave = new Cave();


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
        
export class MapHelper
{
    /**
    * Initializes the helper with cave and map dependencies,
    * including random map object placement.
     */
    public static initialize(): void {
        cave.loadCave("cave1")
        return; // DO THIS CODE
    }

    /**
     * Returns hazards in the player's current room.
     * Hazard names are "wumpus", "bat", and "pit".
     * If wumpus is present, it appears first in the result.
     */
    public static getHazardsInPlayerRoom(): string[] {
        const hazards: string[] = []
        const hazardRoomNums: number[] = [
            Map.getRoomLocation("wumpus" as MapObjectType),
            Map.getRoomLocation("bat1" as MapObjectType),
            Map.getRoomLocation("bat2" as MapObjectType),
            Map.getRoomLocation("pit1" as MapObjectType),
            Map.getRoomLocation("pit2" as MapObjectType)
        ];
        const playerRoom: number =  Map.getRoomLocation("player" as MapObjectType)
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
            Map.getRoomLocation("wumpus" as MapObjectType),
            Map.getRoomLocation("bat1" as MapObjectType),
            Map.getRoomLocation("bat2" as MapObjectType),
            Map.getRoomLocation("pit1" as MapObjectType),
            Map.getRoomLocation("pit2" as MapObjectType)
        ];
        
        const playerRoom: number =  Map.getRoomLocation("player" as MapObjectType)
        for (let i = 0; i < hazardRoomNums.length; i++) {
            const adjacentRooms: number[] = cave.getAdjacentRooms(playerRoom);
            // if any adjacent room contains this hazard, add its warning
            if (adjacentRooms.includes(hazardRoomNums[i])) {
                hazards.push(hazardNames[i]);
            }
        }
        return hazards;
    }

    /**
     * Moves the wumpus after a missed shot to a room up to two moves away.
     * Returns the new room number.
     */
    moveWumpusAfterMiss(): number;

    /**
     * Returns a secret fact about current map state.
     */
    getSecret(): string;

    /**
     * Moves the player to a random room after a bat encounter.
     * Returns the new room number.
     */
    movePlayerAfterBatEncounter(excludedRooms?: number[]): number;
}