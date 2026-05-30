import type { CaveRoomDirections } from "../shared/CaveRoomDirections";

export interface IGameControl {

    /**
     * Initializes all game dependencies and renders the game UI.
     */
    init(containerSelector: string): void;

    /**
     * Runs a trivia challenge and returns the challenge outcome.
     */

    /**
     * Attempts to move the player one room in the specified direction.
     */
    movePlayer(caveRoomDirection: CaveRoomDirections): string;

    /**
     * Shoots an arrow through the selected doorway direction.
     */
    shootArrow(caveRoomDirection: CaveRoomDirections): string;

    /**
     * Attempts to buy arrows by completing a trivia challenge.
     */
    purchaseArrow(): string;

    /**
     * Attempts to buy a secret by completing a trivia challenge.
     */
    purchaseSecret(): string;

    /**
     * Displays the high scores.
     */
    viewHighScores(): string;
}