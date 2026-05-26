import type { ICave } from "/workspaces/TeamA/src/components/cave/ICave.ts";
import { Map } from "./Map";

export class MapHelper
{
    /**
    * Initializes the helper with cave and map dependencies,
    * including random map object placement.
     */
    public static initialize(cave: ICave, map: Map): void {
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
    getWarningsNearPlayer(): string[];

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