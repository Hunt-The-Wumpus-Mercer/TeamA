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
import { initGameDisplay } from "../displayImage/ImageLoader";
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
    private gameMode: 'move' | 'attack' = 'move';
    private pause = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

    init(containerSelector: string): void {
        const $root = $(containerSelector);
        $root.empty();
        
        // Get available caves
        const caves = this.cave.getAvailableCaves();
        const caveOptions = caves.map(cave => `<option value="${cave}">${cave}</option>`).join('');
        
        // Create starting ui
        const $startUI = $(`
            <div id="setup-form" style="padding: 20px; text-align: center;">
                <h2>Hunt the Wumpus</h2>
                <div style="margin: 20px 0;">
                    <label for="player-name">Player Name:</label>
                    <input type="text" id="player-name" placeholder="Enter your name" style="padding: 5px; margin: 0 10px;">
                </div>
                <div style="margin: 20px 0;">
                    <label for="cave-select">Select Cave:</label>
                    <select id="cave-select" style="padding: 5px; margin: 0 10px;">
                        ${caveOptions}
                    </select>
                </div>
                <button id="start-btn" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Start Game</button>
            </div>
        `);
        
        $root.append($startUI);
        
        $('#start-btn').on('click', () => {
            const playerName = $('#player-name').val() as string || 'Player';
            const caveSelect = $('#cave-select').val() as string;
            
            this.player.setPlayerName(playerName);
            this.cave.loadCave(caveSelect);
            
            $startUI.remove();
            
            const $gameContainer = $('<div id="game-container"></div>');
            const $triviaContainer = $('<div data-slot="trivia-ui"></div>');
            const $highScoreContainer = $('<div data-slot="high-score-ui"></div>');
            const $terminalContainer = $('<div data-slot="terminal-ui"></div>');
            
            $root.append($gameContainer, $triviaContainer, $highScoreContainer, $terminalContainer);
            this.image = initGameDisplay('#game-container');
            this.trivia.init($triviaContainer);
            this.highScores.init($highScoreContainer);
            this.terminal.init($terminalContainer);
            
            this.startGame();
            this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
            this.image.setCallbacks(
                () => {
                    this.gameMode = 'attack';
                    this.image.setMode('attack');
                    this.image.addTerminalMessage('Attack mode enabled - press Q/E/W/D/A/S to shoot');
                },
                () => {
                    this.gameMode = 'move';
                    this.image.setMode('move');
                    this.image.addTerminalMessage('Move mode enabled - press Q/E/W/D/A/S to move');
                },
                async () => {
                    const result = await this.purchaseArrow();
                    this.image.addTerminalMessage(result);
                    this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
                }
            );
            this.terminal.println("Game started! Use Q/E/W/D/A/S to move");
            this.movement();
        });
    }
    


    public startGame(): void {
        this.player.incrementResource("arrows", 3);
        const total = this.cave.getRoomCount();
        const used = new Set<number>();
        const randNotTunnelRoom = () => {
            let rand: number;
            do { rand = Math.floor(Math.random() * total) + 1; }
            while (used.has(rand));
            used.add(rand);
            if (this.cave.checkIfTunnel(rand)) return randNotTunnelRoom();
            else return rand;
        };
        this.startRoom = randNotTunnelRoom();
        Map.setRoomLocation(MapObjectType.player, this.startRoom);
        Map.setRoomLocation(MapObjectType.wumpus, randNotTunnelRoom());
        Map.setRoomLocation(MapObjectType.bat1, randNotTunnelRoom());
        Map.setRoomLocation(MapObjectType.bat2, randNotTunnelRoom());
        Map.setRoomLocation(MapObjectType.pit1, randNotTunnelRoom());
        Map.setRoomLocation(MapObjectType.pit2, randNotTunnelRoom());
        this.running = true;
        void this.update();
    }
    public movement(): void {
        document.addEventListener('keydown', (event) => {
            if (!this.running) return;
            console.log(`Key pressed: ${event.key} (Code: ${event.code})`);
            
            const direction = this.getDirectionFromKey(event.key);
            if (!direction) return;
            
            if (this.gameMode === 'move') {
                this.movePlayer(direction);
            } else if (this.gameMode === 'attack') {
                this.shootArrow(direction);
            }
        });
    }

    private getDirectionFromKey(key: string): CaveRoomDirections | null {
        switch (key) {
            case 'q': return 'north_west';
            case 'e': return 'north_east';
            case 'w': return 'north';
            case 'd': return 'south_east';
            case 'a': return 'south_west';
            case 's': return 'south';
            default: return null;
        }
    }
    private async update(): Promise<void> {
        while (this.running) {
            this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
            await this.pause(2000);
        }
    }
    movePlayer(caveRoomDirection: CaveRoomDirections): void {
        if (this.map.movePlayer(caveRoomDirection) == -1) {
            const msg = `Player could not move to the ${caveRoomDirection}`;
            this.terminal.println(msg);
            this.image.addTerminalMessage(msg);
        }
        else {
            const msg = `Player moved to the ${caveRoomDirection}`;
            this.terminal.println(msg);
            this.image.addTerminalMessage(msg);
        }
        this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
    }

    shootArrow(caveRoomDirection: CaveRoomDirections): string {
        if (this.map.fireArrow(caveRoomDirection) === -1) {
            return "";
        }
        else if (this.map.fireArrow(caveRoomDirection) === true) {
            this.player.setWumpusKilled();
            const msg = "You hit the wumpus!";
            this.terminal.println(msg);
            this.image.addTerminalMessage(msg);
            this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
            return msg;
        }
        else {
            const msg = "You missed!";
            this.terminal.println(msg);
            this.image.addTerminalMessage(msg);
            this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
            return msg;
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