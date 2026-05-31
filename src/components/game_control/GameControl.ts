import { Cave } from "../cave/Cave";
import { HighScore } from "../high_scores/HighScores";
import { HighScoreGraphics } from "../high_scores/HighScoreGraphics";
import type { IPerformance } from "../high_scores/IHighScores";
import { Map } from "../map/Map";
import { MapObjectType } from "../map/IMap";
import { Player } from "../player/Player";
import type { CaveRoomDirections } from "../shared/CaveRoomDirections";
import { TriviaGraphics } from "../trivia/TriviaGraphics";
import type { EventType } from "../trivia/ITrivia";
import type { IGameControl } from "./IGameControl";
import { Terminal } from "../Terminal";
import { ImageScreen } from "../displayImage/ImageScreen";
import $ from "jquery";

export class GameControl implements IGameControl {
    private player: Player = new Player();
    private cave: Cave = new Cave();
    private map: Map = new Map(this.cave, this.player);
    private highScoreData: HighScore = new HighScore();
    private highScores: HighScoreGraphics = new HighScoreGraphics();
    private trivia: TriviaGraphics = new TriviaGraphics();
    private terminal: Terminal = new Terminal();
    private image: ImageScreen = new ImageScreen();
    private startRoom: any;
    private running: boolean = false;
    private pause = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

    init(containerSelector: string): void {
        const $root = $(containerSelector);
        $root.empty();
        const $triviaContainer = $('<div data-slot="trivia-ui"></div>');
        const $highScoreContainer = $('<div data-slot="high-score-ui"></div>');
        $root.append($triviaContainer, $highScoreContainer);
        this.trivia.init($triviaContainer);
        this.highScores.init($highScoreContainer);
    }
    


    public startGame(): void {
        this.player.incrementResource("arrows", 2);
        const total = this.cave.getRoomCount();
        const used = new Set<number>();
        const random = () => {
            let rand: number;
            do { rand = Math.floor(Math.random() * total) + 1; }
            while (used.has(rand));
            used.add(rand);
            return rand;
        };
        this.startRoom = random();
        Map.setRoomLocation(MapObjectType.player, this.startRoom);
        Map.setRoomLocation(MapObjectType.wumpus, random());
        Map.setRoomLocation(MapObjectType.bat1, random());
        Map.setRoomLocation(MapObjectType.bat2, random());
        Map.setRoomLocation(MapObjectType.pit1, random());
        Map.setRoomLocation(MapObjectType.pit2, random());
        this.running = true;
        void this.update();
    }
    public movement(): void {
        while(this.running) {
        document.addEventListener('keydown', (event) => {
        console.log(`Key pressed: ${event.key} (Code: ${event.code})`);
        if (event.key === "w"){
            this.movePlayer('north_west');
        } else if (event.key === "e"){
            this.movePlayer('north_east');
        } else if (event.key === "d") {
            this.movePlayer('east');
        } else if (event.key === "x") {
            this.movePlayer('south_east');
        } else if (event.key === "z") {
            this.movePlayer('south_west');
        } else if (event.key === "a") {
            this.movePlayer('west');
        } else {

        }
        });
    }
    }
    private async update(): Promise<void> {
        while (this.running) {
            this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
            await this.pause(2000);
        }
    }
    movePlayer(caveRoomDirection: CaveRoomDirections): void {
        this.terminal.println(`Player moved ${caveRoomDirection}`);
        this.map.movePlayer(caveRoomDirection);
    }

    shootArrow(caveRoomDirection: CaveRoomDirections): string {
        if (this.map.fireArrow(caveRoomDirection) === -1) {
            return "";
        }
        else if (this.map.fireArrow(caveRoomDirection) === true) {
            this.player.setWumpusKilled();
            this.terminal.println("You hit the wumpus!");
            return "You hit the wumpus!";
        }
        else {
            this.terminal.println("You missed!");
            return "You missed!";
        }
    }

    async purchaseArrow(): Promise<string> {
        this.player.incrementResource("arrows");
        return this.runTriviaEvent("ARROWS", 'You bought arrows.', 'Not enough correct answers to buy arrows.');
    }

    async purchaseSecret(): Promise<string> {
        return this.runTriviaEvent("SECRET", this.map.wumpusDirection(), 'You failed to buy a secret.');
    }

    async saveFromPit(): Promise<string> {
        this.terminal.println("You escaped the pit!");
        return this.runTriviaEvent("PIT", 'You escaped the pit!', 'You fell into the pit and died');
    }

    async escapeWumpus(): Promise<string> {
        return this.runTriviaEvent("WUMPUS", 'You escaped the Wumpus!','You died by wumpus');
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

    private async runTriviaEvent(eventType: EventType, successMessage: string | (() => string) | null | CaveRoomDirections, failureMessage: string | (() => string)): Promise<string> {
        this.player.decrementResource("coins");
        if (successMessage === null) {
            return 'NULL ERROR';
        }
        const passed = await this.trivia.showQuestions(eventType);
        const message = passed ? successMessage : failureMessage;
        const output = typeof message === "function" ? message() : message;
        this.terminal.println(output);
        return output;
    }

}