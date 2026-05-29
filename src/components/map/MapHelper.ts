import type { ICave } from "/workspaces/TeamA/src/components/cave/ICave.ts";
import { Cave } from "/workspaces/TeamA/src/components/cave/Cave.ts";

export class MapHelper
{
    const cave = new Cave();
    /**
    * Initializes the helper with cave and map dependencies,
    * including random map object placement.
     */
    public static initialize(cave: ICave): void {
        cave.loadCave("cave1")
        return; // DO THIS CODE
    }

    /**
     * Returns hazards in the player's current room.
     * Hazard names are "wumpus", "bat", and "pit".
     * If wumpus is present, it appears first in the result.
     */
    public static getHazardsInPlayerRoom(): string[] {
        const wumpusRoom = Map.getRoomLocation("wumpus");
    }

    /**
     * Returns warning messages for hazards in rooms adjacent to the player.
     * Warning messages are unique and may include multiple entries.
     */
    getWarningsNearPlayer(): string[] {
        const warnings: string[] = [];
        warnings.push("hi");
        return warnings;
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