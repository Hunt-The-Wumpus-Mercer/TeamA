export interface HighScoreData {
    playerName: string;
    caveName: string;
    score: number;
    turns: number;
    arrowsLeft: number;
    coins: number;
}

export interface IPerformance {
    won: boolean;
    turnes: number;
    arrowsLeft: number;
    coins: number;
}