import type { PlayerResourceType } from "./IPlayer";

export class Player {
    private playerName: string = "";

    /**
     * Returns the player's name.
     */
    getPlayerName(): string {
        return this.playerName;
    }

    /**
     * Sets the player's name.
     */
    setPlayerName(name: string): void {
        this.playerName = name;
    }

    /** Returns the current value of the requested resource. */
    getResource(resource: PlayerResourceType): number {
        const value = localStorage.getItem(resource);
        return value ? parseInt(value) : 0;
    }

    /** Increments the requested resource and returns the resulting value. */
    incrementResource(resource: PlayerResourceType, amount?: number): number {
        const current = this.getResource(resource);
        localStorage.setItem(resource, (current + (amount || 1)).toString());
        return this.getResource(resource);
    }

    /** Decrements the requested resource and returns the resulting value. */
    decrementResource(resource: PlayerResourceType, amount?: number): number {
        this.incrementResource(resource, -(amount || 1));
        return this.getResource(resource);
    }

    /**
     * Marks that the player has killed the wumpus.
     */
    setWumpusKilled(): void {
        localStorage.setItem("wumpusKilled", "true");
    }
}