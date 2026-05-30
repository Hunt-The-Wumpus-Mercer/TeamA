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



    movePlayer(caveRoomDirection: CaveRoomDirections): string {
        throw new Error("Method not implemented.");
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