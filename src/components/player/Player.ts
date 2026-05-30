import type { IPlayer, PlayerResourceType } from "./IPlayer";

export const PlayerResources = {
    arrows: 0,
    coins: 0,
    turns: 0
};

export class Player implements IPlayer {
    private wumpusKilled: boolean = false;
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
        const value = PlayerResources[resource];
        return value !== undefined ? value : 0;
    }

    /** Sets the requested resource to the given value. */
    setResource(resource: PlayerResourceType, amount: number): void {
        PlayerResources[resource] = amount;
    }

    /** Increments the requested resource and returns the resulting value. */
    incrementResource(resource: PlayerResourceType, amount?: number): number {
        const nextValue = this.getResource(resource) + (amount || 1);
        this.setResource(resource, nextValue);
        
        return nextValue;
    }

    /** Decrements the requested resource and returns the resulting value. */
    decrementResource(resource: PlayerResourceType, amount?: number): number {
        const nextValue = this.getResource(resource) - (amount || 1);
        this.setResource(resource, nextValue);
        
        return nextValue;
    }

    /**
     * Marks that the player has killed the wumpus.
     */
    setWumpusKilled(): void {
        this.wumpusKilled = true;
    }

    isWumpusKilled(): boolean {
        return this.wumpusKilled;
    }
}