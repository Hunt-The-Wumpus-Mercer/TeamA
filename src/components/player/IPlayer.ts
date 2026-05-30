export const PlayerResourceType = {
    ARROWS: "arrows",
    COINS: "coins",
    TURNS: "turns",
} as const;

export type PlayerResourceType = (typeof PlayerResourceType)[keyof typeof PlayerResourceType];

<<<<<<< HEAD
export interface IPlayer {
    /**
     * Returns the player's name.
     */
    getPlayerName(): string;

    /**
     * Sets the player's name.
     */
    setPlayerName(name: string): void;

    /** Returns the current value of the requested resource. */
    getResource(resource: PlayerResourceType): number;

    /** Increments the requested resource and returns the resulting value. */
    incrementResource(resource: PlayerResourceType, amount?: number): number;

    /** Decrements the requested resource and returns the resulting value. */
    decrementResource(resource: PlayerResourceType, amount?: number): number;

    /**
     * Marks that the player has killed the wumpus.
     */
    setWumpusKilled(): void;
}
=======
export const PlayerResources = new Map<string, number>([
    ['arrows', 0],
    ['coins', 0],
    ['turns', 0]
]);
>>>>>>> c80b2b5 (Added Graphics)
