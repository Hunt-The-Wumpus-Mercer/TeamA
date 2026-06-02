import type { CaveRoomDirections } from "../shared/CaveRoomDirections";

export const GameMode = {
    ATTACK: "attack",
    MOVE: "move"
} as const;

export type GameMode = (typeof GameMode)[keyof typeof GameMode];

export interface IGameControl {

    /**
     * Initializes all game dependencies and renders the game UI.
     */
    init(containerSelector: string): void;
    
    /**
     * Attempts to move the player one room in the specified direction.
     */
    movePlayer(caveRoomDirection: CaveRoomDirections): Promise<void>;

    /**
     * Shoots an arrow through the selected doorway direction.
     */
    shootArrow(caveRoomDirection: CaveRoomDirections): Promise<void>;

    /**
     * Attempts to buy arrows by completing a trivia challenge.
     */
    purchaseArrow(): Promise<string>;

    /**
     * Attempts to buy a secret by completing a trivia challenge.
     */
    purchaseSecret(): Promise<string>;

    /**
     * Displays the high scores.
     */
    viewHighScores(): Promise<string>;
}