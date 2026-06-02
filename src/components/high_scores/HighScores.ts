import type { HighScoreData , IPerformance} from "./IHighScores";
export class HighScore {
    // encryption key for JSON file
    private readonly KEY = '1a2b3c';
    private readonly MAX_SCORES = 10;

    private getStorage(): Storage | undefined {
        try {
            return globalThis.localStorage;
        } catch {
            return undefined;
        }
    }

    private normalizeScore(score: Partial<HighScoreData>): HighScoreData {
        return {
            playerName: score.playerName?.trim() || 'EMPTY',
            caveName: score.caveName?.trim() || 'Unknown Cave',
            score: Number.isFinite(score.score) ? Number(score.score) : 0,
            turns: Number.isFinite(score.turns) ? Number(score.turns) : 0,
            arrowsLeft: Number.isFinite(score.arrowsLeft) ? Number(score.arrowsLeft) : 0,
            coins: Number.isFinite(score.coins) ? Number(score.coins) : 0,
        };
    }

    //calculates score
    public calculateScore(perf: IPerformance): number {
        if (!perf.won) return 0;

        const baseScore = 100;
        const penalty = perf.turnes;
        const bonus = perf.arrowsLeft * 10 + perf.coins;
        return Math.max(0, baseScore - penalty + bonus);
    }

    // returns scores
    public getScores(): HighScoreData[] {
        const storage = this.getStorage();
        if (!storage) return [];

        const scoresJSON = storage.getItem(this.KEY);
        if (!scoresJSON) return [];

        try {
            const parsedScores = JSON.parse(scoresJSON) as Partial<HighScoreData>[];
            if (!Array.isArray(parsedScores)) {
                return [];
            }

            const normalizedScores = parsedScores
                .map((score) => this.normalizeScore(score))
                .sort((a, b) => b.score - a.score)
                .slice(0, this.MAX_SCORES);

            return normalizedScores.length > 0 ? normalizedScores : [];
        } catch {
            return [];
        }
    }

    // adds scores
    public addScore(playerName: string, perf: IPerformance): void {
        const score = this.calculateScore(perf);
        if (score <= 0) return;

        const Entry: HighScoreData = {
            playerName: playerName.trim() || 'User',
            caveName: 'Unknown Cave',
            score: score,
            turns: perf.turnes,
            arrowsLeft: perf.arrowsLeft,
            coins: perf.coins,
        };

        const currentScores = this.getScores();
        currentScores.push(Entry);

        //sort scores
        currentScores.sort((a, b) => b.score - a.score);
        //makes top score to add maximum number of shown scores
        const topScores = currentScores.slice(0, this.MAX_SCORES);
        const storage = this.getStorage();
        storage?.setItem(this.KEY, JSON.stringify(topScores));
    }
}