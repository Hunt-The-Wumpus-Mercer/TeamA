import { Cave } from "../cave/Cave";
import { HighScore } from "../high_scores/HighScores";
import { HighScoreGraphics } from "../high_scores/HighScoreGraphics";
import type { IPerformance } from "../high_scores/IHighScores";
import { Map } from "../map/Map";
import { MapObjectType } from "../map/IMap";
import { Player } from "../player/Player";
import { CaveRoomDirections } from "../shared/CaveRoomDirections";
import { TriviaGraphics } from "../trivia/TriviaGraphics";
import type { EventType } from "../trivia/ITrivia";
import { GameMode, type IGameControl } from "./IGameControl";
import { Terminal } from "../Terminal";
import { ImageScreen } from "../displayImage/ImageScreen";
import { initGameDisplay } from "../displayImage/ImageLoader";
import $ from "jquery";
import { PlayerResourceType } from "../player/IPlayer";

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
    private gameMode: GameMode = GameMode.MOVE;
    private busy: boolean = false;
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
            this.terminal.mount($terminalContainer.get(0));
            
            this.startGame();
            this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
            this.image.setPlayerRoom(this.startRoom, this.cave.getRoomCount());
            this.image.setCallbacks(
                () => {
                    this.gameMode = GameMode.ATTACK;
                    this.image.setMode(GameMode.ATTACK);
                    this.image.addTerminalMessage('Attack mode enabled - press Q/E/W/D/A/S to shoot');
                },
                () => {
                    this.gameMode = GameMode.MOVE;
                    this.image.setMode(GameMode.MOVE);
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
        this.player.incrementResource(PlayerResourceType.ARROWS, 3);
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
        Map.setRoomLocation(MapObjectType.PLAYER, this.startRoom);
        Map.setRoomLocation(MapObjectType.WUMPUS, randNotTunnelRoom());
        Map.setRoomLocation(MapObjectType.BAT_1, randNotTunnelRoom());
        Map.setRoomLocation(MapObjectType.BAT_2, randNotTunnelRoom());
        Map.setRoomLocation(MapObjectType.PIT_1, randNotTunnelRoom());
        Map.setRoomLocation(MapObjectType.PIT_2, randNotTunnelRoom());
        this.running = true;
        void this.update();
    }
    public movement(): void {
        document.addEventListener('keydown', (event) => {
            if (!this.running || this.busy) return;
            console.log(`Key pressed: ${event.key} (Code: ${event.code})`);

            const direction = this.getDirectionFromKey(event.key);
            if (!direction) return;

            // Block further input while an async action (move + hazard handling
            // or a shot) is resolving so trivia/high-score screens aren't
            // interrupted by stray key presses.
            this.busy = true;
            const action = this.gameMode === GameMode.MOVE
                ? this.movePlayer(direction)
                : this.shootArrow(direction);
            void action.finally(() => { this.busy = false; });
        });
    }

    private getDirectionFromKey(key: string): CaveRoomDirections | null {
        switch (key) {
            case 'q': return CaveRoomDirections.NORTH_WEST;
            case 'e': return CaveRoomDirections.NORTH_EAST;
            case 'w': return CaveRoomDirections.NORTH;
            case 'd': return CaveRoomDirections.SOUTH_EAST;
            case 'a': return CaveRoomDirections.SOUTH_WEST;
            case 's': return CaveRoomDirections.SOUTH;
            default: return null;
        }
    }
    private async update(): Promise<void> {
        while (this.running) {
            this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
            await this.pause(2000);
        }
    }
    async movePlayer(caveRoomDirection: CaveRoomDirections): Promise<void> {
        const prettyDir = caveRoomDirection.replace(/_/g, ' ');
        if (this.map.movePlayer(caveRoomDirection) == -1) {
            this.announce(`There is no tunnel to the ${prettyDir}.`);
            return;
        }

        this.player.incrementResource("turns");
        const room = Map.getRoomLocation(MapObjectType.PLAYER);
        this.announce(`You move ${prettyDir} into room ${room}.`);
        this.image.movePlayerInDirection(caveRoomDirection);

        // Surface warnings about hazards in adjacent rooms.
        for (const warningMessage of this.map.getWarningsNearPlayer()) {
            this.announce(warningMessage);
        }

        this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
        if (await this.checkBankruptcy()) return;
        await this.handleHazards();
    }

    async shootArrow(caveRoomDirection: CaveRoomDirections): Promise<void> {
        const prettyDir = caveRoomDirection.replace(/_/g, ' ');
        const result = this.map.fireArrow(caveRoomDirection);
        this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());

        if (result === true) {
            this.player.setWumpusKilled();
            await this.gameOver(true, 'Your arrow finds its mark — the Wumpus is slain! You win!');
            return;
        } else if (result === -1) {
            this.announce(`There is no tunnel to the ${prettyDir} to shoot down.`);
        } else {
            this.announce('Your arrow vanishes into the dark. You missed, and the Wumpus moves...');
        }

        if (this.player.getArrowsLeft() <= 0) {
            await this.gameOver(false, 'You are out of arrows. The Wumpus will get you eventually. Game over.');
        }
    }

    /**
     * Checks the player's current room for hazards and drives the matching
     * graphics: trivia challenges for the pit and Wumpus, and a relocation for
     * bats. Ends the game (showing high scores) on a fatal encounter.
     */
    private async handleHazards(): Promise<void> {
        const room = Map.getRoomLocation(MapObjectType.PLAYER);

        if (room === Map.getRoomLocation(MapObjectType.WUMPUS)) {
            this.announce('You walked straight into the Wumpus!');
            const survived = await this.trivia.showQuestions('WUMPUS');
            if (survived) {
                this.announce('You kept your nerve and slipped past the Wumpus!');
                Map.setRoomLocation(MapObjectType.WUMPUS, this.randomNonTunnelRoom(new Set([room])));
            } else {
                await this.gameOver(false, 'The Wumpus devoured you. Game over.');
            }
            return;
        }

        if (room === Map.getRoomLocation(MapObjectType.PIT_1) ||
            room === Map.getRoomLocation(MapObjectType.PIT_2)) {
            this.announce('The floor gives way — you tumble toward a bottomless pit!');
            const survived = await this.trivia.showQuestions('PIT');
            if (survived) {
                this.announce('You catch the ledge and haul yourself back to safety!');
            } else {
                await this.gameOver(false, 'You fell into the pit. Game over.');
            }
            return;
        }

        if (room === Map.getRoomLocation(MapObjectType.BAT_1) ||
            room === Map.getRoomLocation(MapObjectType.BAT_2)) {
            const dest = this.randomNonTunnelRoom(new Set([room]));
            Map.setRoomLocation(MapObjectType.PLAYER, dest);
            this.announce(`Giant bats snatch you up and drop you in room ${dest}!`);
            await this.handleHazards();
        }
    }

    /**
     * Ends the game, recording a high score on a win and showing the high
     * score board.
     */
    private async gameOver(won: boolean, message: string): Promise<void> {
        this.running = false;
        this.announce(message);

        if (won) {
            const perf: IPerformance = {
                won: true,
                turnes: this.player.getMoves(),
                arrowsLeft: this.player.getArrowsLeft(),
                coins: this.player.getGold()
            };
            this.highScoreData.addScore(this.player.getPlayerName(), perf);
            this.highScores.show(
                this.highScoreData,
                this.player.getPlayerName(),
                this.highScoreData.calculateScore(perf)
            );
        } else {
            this.highScores.show(this.highScoreData);
        }
    }

    /** Picks a random non-tunnel room, optionally avoiding a set of rooms. */
    private randomNonTunnelRoom(exclude: Set<number> = new Set()): number {
        const total = this.cave.getRoomCount();
        let rand = 1;
        for (let guard = 0; guard < 1000; guard++) {
            rand = Math.floor(Math.random() * total) + 1;
            if (!exclude.has(rand) && !this.cave.checkIfTunnel(rand)) return rand;
        }
        return rand;
    }

    /** Echoes a message to both the side terminal and the in-game display. */
    private announce(message: string): void {
        this.terminal.println(message);
        this.image.addTerminalMessage(message);
    }

    async purchaseArrow(): Promise<string> {
        const result = await this.runTriviaEvent("ARROWS", 'You bought arrows.', 'Not enough correct answers to buy arrows.');
        if (result == 'You bought arrows.') {
            this.player.incrementResource(PlayerResourceType.ARROWS);
        }

        return result
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
                turnes: this.player.getMoves(),
                arrowsLeft: this.player.getArrowsLeft(),
                coins: this.player.getGold()
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
        if (this.player.getGold() <= 0) {
            return "BANKRUPT";
        }
        this.player.decrementResource("coins");
        this.image.updateCounts(this.player.getArrowsLeft(), this.player.getGold());
        if (await this.checkBankruptcy()) return 'BANKRUPT';
        if (successMessage === null) {
            return 'NULL ERROR';
        }
        const passed = await this.trivia.showQuestions(eventType);
        const message = passed ? successMessage : failureMessage;
        const output = typeof message === "function" ? message() : message;
        this.terminal.println(output);
        return output;
    }

    /**
     * Ends the game if the player's coin balance has dropped below zero.
     * Returns true when the game was ended so callers can stop processing.
     */
    private async checkBankruptcy(): Promise<boolean> {
        if (this.running && this.player.getGold() < 0) {
            await this.gameOver(false, 'You ran out of coins. Game over.');
            return true;
        }
        return false;
    }

}