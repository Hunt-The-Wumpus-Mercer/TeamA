export interface IHighScores {
    playerName: string;
    score: number;
    moves: number;
    arrowsLeft: number;
    gold: number;
}

export interface IPerformance {
    won: boolean;
    moves: number;
    arrowsLeft: number;
    gold: number;
}