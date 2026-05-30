import { Cave } from "../cave/Cave";
import { HighScore } from "../high_scores/HighScores";
import { HighScoreGraphics } from "../high_scores/HighScoreGraphics";
import type { IPerformance } from "../high_scores/IHighScores";
import { Map } from "../map/Map";
import { Player } from "../player/Player";
import type { CaveRoomDirections } from "../shared/CaveRoomDirections";
import { TriviaGraphics } from "../trivia/TriviaGraphics";
import type { EventType } from "../trivia/ITrivia";
import type { IGameControl } from "./IGameControl";
import $ from "jquery";

export class GameControl implements IGameControl {
    private player: Player = new Player();
    private cave: Cave = new Cave();
    private map: Map = new Map(this.cave, this.player);
    private highScoreData: HighScore = new HighScore();
    private highScores: HighScoreGraphics = new HighScoreGraphics();
    private trivia: TriviaGraphics = new TriviaGraphics();

    init(containerSelector: string): void {
        const $root = $(containerSelector);
        $root.empty();
        const $triviaContainer = $('<div data-slot="trivia-ui"></div>');
        const $highScoreContainer = $('<div data-slot="high-score-ui"></div>');
        $root.append($triviaContainer, $highScoreContainer);
        this.trivia.init($triviaContainer);
        this.highScores.init($highScoreContainer);
    }

    

    movePlayer(caveRoomDirection: CaveRoomDirections): void {
        this.map.movePlayer(caveRoomDirection);
    }

    shootArrow(caveRoomDirection: CaveRoomDirections): string {
        if (this.map.fireArrow(caveRoomDirection) === -1) {
            return "";
        }
        else if (this.map.fireArrow(caveRoomDirection) === true) {
            this.player.setWumpusKilled();
            return "You hit the wumpus!";
        }
        else {
            return "You missed!";
        }
    }

    async purchaseArrow(): Promise<string> {
        return this.runTriviaEvent("ARROWS", "You bought arrows.", "Not enough correct answers to buy arrows.");
    }

    async purchaseSecret(): Promise<string> {
        return this.runTriviaEvent("SECRET", "You bought a secret", "You failed to buy a secret");
    }

    async saveFromPit(): Promise<string> {
        return this.runTriviaEvent("PIT", "You escaped the pit!", "You fell into the pit and died");
    }

    async escapeWumpus(): Promise<string> {
        return this.runTriviaEvent("WUMPUS", "You escaped the Wumpus!", "You died by wumpus");
    }

    async addHighScore(): Promise<void> {
        if (this.player.isWumpusKilled() === true) {
            const perf: IPerformance = {
                won: true,
                moves: this.player.getMoves(),
                arrowsLeft: this.player.getArrowsLeft(),
                gold: this.player.getGold()
            };
            this.highScoreData.addScore(this.player.getPlayerName(), perf);
            await this.viewHighScores();
        }
    }
    async viewHighScores(): Promise<string> {
        this.highScores.show(this.highScoreData);
        return Promise.resolve("HighScores");
    }

    private async runTriviaEvent(eventType: EventType, successMessage: string, failureMessage: string): Promise<string> {
        this.player.decrementResource("coins");
        const passed = await this.trivia.showQuestions(eventType);
        return passed ? successMessage : failureMessage;
    }

}