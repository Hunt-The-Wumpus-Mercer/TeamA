import { Cave } from "../cave/Cave";
import { Hazards, MapObjectType, WumpusState } from "./IMap";
import { mapObjectLocations, type HexRoomResult } from "./IMap";
import { CaveRoomDirections } from "../shared/CaveRoomDirections";
import { Player } from "../player/Player";
import { PlayerResourceType } from "../player/IPlayer";

const wumpusWarnings = [
    "You smell something terrible and monstrous nearby.",
    "A low, rumbling growl vibrates through the stone floor.",
    "The air feels heavy, hot, and thick with the scent of blood."
];

const batWarnings = [
    "You hear a faint, chaotic fluttering of wings nearby.",
    "High-pitched squeaks echo from a tunnel just ahead.",
    "A sudden draft of air brushes past your face, smelling of guano."
];

const pitWarnings = [
    "A cold, damp breeze blows up from the darkness ahead.",
    "You hear the faint sound of pebbles crumbling and falling into an endless void.",
    "The ground slopes slightly downward, and the air smells of old earth."
];

const directionsOrder = [
            CaveRoomDirections.NORTH,
            CaveRoomDirections.NORTH_WEST,
            CaveRoomDirections.NORTH_EAST,
            CaveRoomDirections.SOUTH,
            CaveRoomDirections.SOUTH_EAST,
            CaveRoomDirections.SOUTH_WEST
        ];

export class Map {
    private cave: Cave;
    private player: Player;
    private wumpusState: WumpusState;
    private visitedRooms: number[];

    constructor(cave: Cave, player: Player) {
        this.cave = cave;
        this.player = player;
        this.wumpusState = WumpusState.SLEEPING;
        this.visitedRooms = [];
    }


    /**
     * Moves the player in the specified direction.
     * Returns the final room index, or -1 if that room is unreachable.
     */
    public movePlayer(direction: CaveRoomDirections): number {
        const playerRoom: number = Map.getRoomLocation(MapObjectType.PLAYER);
        const connectedRooms: number[] = this.cave.getConnectedRooms(playerRoom);
        console.debug(connectedRooms);
        const directionIndex: number = directionsOrder.indexOf(direction);
        console.debug(directionIndex);
        const targetRoom: number = connectedRooms[directionIndex];
        console.debug(targetRoom);

        // Pass if the target room is not connected
        if (!targetRoom || targetRoom <= 0) return -1;
    
        // Exploration bonus
        if (!this.visitedRooms.includes(targetRoom)) {
            this.player.incrementResource(PlayerResourceType.COINS);
            this.visitedRooms.push(targetRoom);
        }

        Map.setRoomLocation(MapObjectType.PLAYER, targetRoom);
        this.simWumpus();
        
        return targetRoom;
    }

    /**
     * Returns hazards in the player's current room.
     * Hazard names are "wumpus", "bat", and "pit".
     * If wumpus is present, it appears first in the result.
     */
    public getHazardsInPlayerRoom(): Hazards[] {
        const playerRoomIndex: number =  Map.getRoomLocation(MapObjectType.PLAYER);

        // Populates hazards
        const hazards: Hazards[] = [];
        if (playerRoomIndex == Map.getRoomLocation(MapObjectType.WUMPUS)) {
            hazards.push(Hazards.WUMPUS);
        }

        if (playerRoomIndex == Map.getRoomLocation(MapObjectType.BAT_1) || playerRoomIndex == Map.getRoomLocation(MapObjectType.BAT_2)) {
            hazards.push(Hazards.BAT);
        }

        if (playerRoomIndex == Map.getRoomLocation(MapObjectType.PIT_1) || playerRoomIndex == Map.getRoomLocation(MapObjectType.PIT_2)) {
            hazards.push(Hazards.PIT);
        }

        return hazards;
    }

    /**
     * Returns warning messages for hazards in rooms adjacent to the player.
     * Warning messages are unique and random out of 3 possible.
     */
    public getWarningsNearPlayer(): string[] {
        // Populates warnings
        const hazards = this.getHazardsInPlayerRoom();

        const warnings: string[] = [];
        hazards.forEach(hazard => {
            switch (hazard) {
                    case Hazards.WUMPUS: 
                        warnings.push(wumpusWarnings[Math.floor(Math.random() * wumpusWarnings.length)]);
                        break;
                    case Hazards.BAT:
                        warnings.push(batWarnings[Math.floor(Math.random() * batWarnings.length)]);
                        break;
                    
                    case Hazards.PIT: 
                        warnings.push(pitWarnings[Math.floor(Math.random() * pitWarnings.length)]);
                        break;
                }
        });

        return warnings;
    }

    /**
     * Returns the direction from the player to the nearest wumpus.
     * If the wumpus is in the same room or unreachable, returns null.
     */
    public wumpusDirection(): CaveRoomDirections | null {
        const playerRoom: number = Map.getRoomLocation(MapObjectType.PLAYER);
        const wumpusRoom: number = Map.getRoomLocation(MapObjectType.WUMPUS);

        if (playerRoom === wumpusRoom || playerRoom <= 0 || wumpusRoom <= 0) {
            return null;
        }

        const queue: number[] = [playerRoom];
        const visited: Set<number> = new Set([playerRoom]);
        const predecessorMap: globalThis.Map<number, number> = new globalThis.Map();

        while (queue.length > 0) {
            const currentRoom = queue.shift() as number;
            if (currentRoom === wumpusRoom) {
                break;
            }

            const adjacentRooms: number[] = this.cave.getConnectedRooms(currentRoom);
            for (const adjacentRoom of adjacentRooms) {
                if (adjacentRoom <= 0 || visited.has(adjacentRoom)) {
                    continue;
                }
                visited.add(adjacentRoom);
                predecessorMap.set(adjacentRoom, currentRoom);
                queue.push(adjacentRoom);
            }
        }

        if (!visited.has(wumpusRoom)) {
            return null;
        }

        let nextRoom = wumpusRoom;
        while (predecessorMap.get(nextRoom) !== playerRoom) {
            const previousRoom = predecessorMap.get(nextRoom);
            if (previousRoom === undefined) {
                return null;
            }
            nextRoom = previousRoom;
        }

        const playerAdjacentRooms: number[] = this.cave.getConnectedRooms(playerRoom);
        const directionIndex = playerAdjacentRooms.indexOf(nextRoom);
        if (directionIndex === -1) {
            return null;
        }

        return directionsOrder[directionIndex];
    }


     /**
     * Returns the room location for the requested map object.
     */
    public static getRoomLocation(mapObject: MapObjectType): number {
        return mapObjectLocations[mapObject];
    }

    /**
     * Sets the room location for the requested map object.
     */
    public static setRoomLocation(mapObject: MapObjectType, roomNumber: number): void {
        mapObjectLocations[mapObject] = roomNumber;
    }

    /**
     * Moves the wumpus after a missed shot to a room up to two moves away.
     * Returns the new room number.
     */
        private moveWumpusAfterMiss(): number {
            const getValidRooms = (room: number) =>
                this.cave.getConnectedRooms(room).filter(r => r > 0); 

            let validRooms = getValidRooms(Map.getRoomLocation(MapObjectType.WUMPUS));
            if (validRooms.length > 0) {
                Map.setRoomLocation(MapObjectType.WUMPUS, validRooms[Math.floor(Math.random() * validRooms.length)]);
            }

            validRooms = getValidRooms(Map.getRoomLocation(MapObjectType.WUMPUS));
            if (validRooms.length > 0) {
                Map.setRoomLocation(MapObjectType.WUMPUS, validRooms[Math.floor(Math.random() * validRooms.length)]);
            }

            return Map.getRoomLocation(MapObjectType.WUMPUS);
    }



    /**
     * Moves the player to a random room after a bat encounter.
     * Returns the new room number.
     */
    private movePlayerAfterBatEncounter(excludedRooms?: number[]): number {
        if (!excludedRooms) excludedRooms = [];
        let roomToGoTo: number = -1;
        while (!excludedRooms.includes(roomToGoTo) && roomToGoTo != -1) {
            roomToGoTo = Math.floor(Math.random() * this.cave.getRoomCount()) + 1
        }
        Map.setRoomLocation(MapObjectType.PLAYER, roomToGoTo);
        return 0;
    }

    /**
     * Simulates firing an arrow in the given direction.
     * Automatically moves wumpus if the player misses.
     * Returns -1 if fired out of bounds or not connected to, otherwise the room fired into.
     */
    public fireArrow(direction: CaveRoomDirections): boolean | number {
        this.player.decrementResource(PlayerResourceType.ARROWS);

        const playerRoom: number = Map.getRoomLocation(MapObjectType.PLAYER);
        const connectedRooms: number[] = this.cave.getConnectedRooms(playerRoom);
        const directionIndex: number = directionsOrder.indexOf(direction);
        if (directionIndex === -1) throw new Error(`Invalid cave direction '${direction}'`);

        const targetRoom: number = connectedRooms[directionIndex];
        if (!targetRoom || targetRoom <= 0) return -1;

        const wumpusRoom: number = Map.getRoomLocation(MapObjectType.WUMPUS);
        if (targetRoom === wumpusRoom) {
            this.wumpusState = WumpusState.DEAD;
            return true;
        }
        
        this.moveWumpusAfterMiss();
        return targetRoom;
    }

    /**
     * Simulates the wumpus. 
     * If the wumpus is sleeping, it wont move.
     * Awakens the wumpus if the player is adjacent.
     */
    private simWumpus(): void {
        const adjacentRooms: number[] = this.cave.getConnectedRooms(Map.getRoomLocation(MapObjectType.WUMPUS))
            .filter(r => r > 0);

        switch (this.wumpusState) {
            case WumpusState.AWAKE:
                if (adjacentRooms.length > 0) {
                    Map.setRoomLocation(MapObjectType.WUMPUS, adjacentRooms[Math.floor(Math.random() * adjacentRooms.length)]);
                }
                break;

            case WumpusState.SLEEPING:
                if (adjacentRooms.includes(Map.getRoomLocation(MapObjectType.PLAYER)))
                    this.wumpusState = WumpusState.AWAKE;
                break;

            case WumpusState.DEAD:
                Map.setRoomLocation(MapObjectType.WUMPUS, -1);
                break;
        }
    }


    
    /**
     * Returns the correct rotation and SVG 
     * file name for the given tunnels room number
     */
    tunnelSVG(room: number): HexRoomResult {
        let indexA = -1;
        let indexB = -1;

        // 1. Find the two active connections
        for (let i = 0; i < 6; i++) {
            if (this.cave.getConnectedRooms(room)[i] > 0) {
                if (indexA === -1) {
                    indexA = i;
                } else {
                    indexB = i;
                    break; // Found both, we can exit early
                }
            }
        }

        // Guard clause in case the array doesn't have exactly two true values
        if (indexA === -1 || indexB === -1) {
            throw new Error("Invalid connection array. Exactly two directions must be true.");
        }

        // 2. Find the relative distance between the two points
        const distance = indexB - indexA;
        let roomAsset = "";

        // 3. Select the room based on the distance
        switch (distance) {
            case 1: 
                roomAsset = "tunnel_1_North_East";
                break;
            case 2:
                roomAsset = "tunnel_2_South_East";
                break;
            case 3:
                roomAsset = "tunnel_3_South";
                break;
            case 4:
                roomAsset = "tunnel_4_South_West";
                break;
            case 5:
                roomAsset = "tunnel_5_North_West";
                break;

            default: throw new Error("Unexpected connection indices.");
    }

    // 4. Calculate clockwise rotation (60° per index step)
    const rotationDegrees = indexA * 60;
    return { roomAsset, rotationDegrees };
    }

    
}