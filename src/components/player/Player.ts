import { PlayerResources } from "./IPlayer";

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
    getResource(resource: string): number {
        const value = PlayerResources.get(resource);
        return value !== undefined ? value : 0;
    }

    /** Sets the requested resource to the given value. */
    setResource(resource: string, amount: number): void {
        PlayerResources.set(resource, amount);
        return;
    }

    /** Increments the requested resource and returns the resulting value. */
    incrementResource(resource: string, amount?: number): number {
        const nextValue = this.getResource(resource) + (amount || 1);
        PlayerResources.set(resource, nextValue);
        return nextValue;
    }

    /** Decrements the requested resource and returns the resulting value. */
    decrementResource(resource: string, amount?: number): number {
        const nextValue = this.getResource(resource) - (amount || 1);
        PlayerResources.set(resource, nextValue);
        return nextValue;
    }

    /**
     * Marks that the player has killed the wumpus.
     */
    setWumpusKilled(): void {
        localStorage.setItem("wumpusKilled", "true");
    }
}