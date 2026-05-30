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
        this.playerName = name.trim();
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

    getMoves(): number {
        return this.getResource("turns");
    }

    setMoves(moves: number): void {
        this.setResource("turns", moves);
    }

    getArrowsLeft(): number {
        return this.getResource("arrows");
    }

    setArrowsLeft(arrowsLeft: number): void {
        this.setResource("arrows", arrowsLeft);
    }

    getGold(): number {
        return this.getResource("coins");
    }

    setGold(gold: number): void {
        this.setResource("coins", gold);
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