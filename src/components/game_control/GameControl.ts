import { Cave } from "../cave/Cave";
import { HighScore } from "../high_scores/HighScores";
import { Map } from "../map/Map";
import { Player } from "../player/Player";
import type { CaveRoomDirections } from "../shared/CaveRoomDirections";
import { Trivia } from "../trivia/Trivia";
import type { IGameControl } from "./IGameControl";

export class GameControl implements IGameControl {
    private player: Player = new Player();
    private cave: Cave = new Cave();
    private map: Map = new Map(this.cave, this.player);
    private highScores: HighScore = new HighScore();
    private trivia: Trivia = new Trivia();

    init(containerSelector: string): void {
        // TODO: load ui
    }

    runTriviaChallenge(questionCount: number, requiredCorrectAnswers: number) {
        let correctAnswers = 0;
        for (let i = 0; i < questionCount; i++) {
            this.trivia.resetQueue();
            let q = this.trivia.getNextQuestion();
            // TODO: display quesion
            // TODO: get user input and store in user answer
            let userAnswer: string = "";

            if (this.trivia.validateAnswer(i, userAnswer)) {
                correctAnswers++;
            }
        }

        if ()
    }

    movePlayer(caveRoomDirection: CaveRoomDirections): string {
        
    }

    shootArrow(caveRoomDirection: CaveRoomDirections): string {
        throw new Error("Method not implemented.");
    }

    purchaseArrow(): string {
        throw new Error("Method not implemented.");
    }

    purchaseSecret(): string {
        throw new Error("Method not implemented.");
    }

    viewHighScores(): string {
        throw new Error("Method not implemented.");
    }

}