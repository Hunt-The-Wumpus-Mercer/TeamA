import type { IHighScores, IPerformance } from "./IHighScores";
import { Player } from "/workspaces/TeamA/src/components/player/Player.ts"
import { PlayerResourceType } from "/workspaces/TeamA/src/components/player/IPlayer.ts";
export class HighScore {
    // encryption key for JSON file
    KEY = '1a2b3c';
    MAX_SCORES = 10;
    private player = new Player(); 
    //calculates score
    public calculateScore(perf: IPerformance): number {
        if (!perf.won) return 0;

        const baseScore = 100;
        const penalty = perf.moves;
        const bonus = perf.arrowsLeft*10+this.player.getResource(PlayerResourceType.COINS);
        return Math.max(0, baseScore - penalty + bonus);
    }
    // returns scores
    public getScores(): IHighScores[] {
        const scoresJSON = localStorage.getItem(this.KEY);
        if (!scoresJSON) return [];

        try {
            return JSON.parse(scoresJSON) as IHighScores[];
        } catch {
            return [];
        }
    }
    // adds scores
    public addScore(playerName: string, perf: IPerformance): void {
        const score = this.calculateScore(perf);
        if (score<=0) return;
        const Entry: IHighScores = {
            playerName: playerName || 'User',
            score: score,
        }
        const currentScores = this.getScores();
        currentScores.push(Entry);

        //sort scores
        currentScores.sort((a, b) => b.score - a.score);
        //makes top score to add maximum number of shown scores
        const topScores = currentScores.slice(0, this.MAX_SCORES);
        localStorage.setItem(this.KEY, JSON.stringify(topScores));
    }
}