import uiTemplate from './ImageScreen.html?raw';
import $ from 'jquery';
import { displaySprite } from './displaySprite';
import attackingButtonUrl from '../../images/attackingButton.png';
import movingButtonUrl from '../../images/movingButton.png';
import arrowIconUrl from '../../images/arrowIcon.png';
import secretButtonUrl from '../../images/secret.png';
import coinIconUrl from '../../images/coinIcon.png';
import playerUrl from '../../images/Player.png';
import { GameMode } from '../game_control/IGameControl';

export class ImageScreen {
    private arrowCount = 0;
    private coinCount = 0;
    private $container!: JQuery;
    private $imageArea!: JQuery;
    private $arrowsCountEl?: JQuery;
    private $coinsCountEl?: JQuery;
    private playerPos = { x: 230, y: 180, size: 60 };
    private cellPositions: { cx: number; cy: number }[] = [];
    private currentCellIdx = -1;
    private playerRoom = 0;
    private roomCount = 0;
    private currentMode: GameMode = GameMode.MOVE;
    private $restartButtonEl?: JQuery;
    private onAttackModeClick?: () => void;
    private onMoveModeClick?: () => void;
    private onArrowButtonClick?: () => void;
    private onSecretButtonClick?: () => void;
    private onRestartButtonClick?: () => void;
    private terminalMessages: string[] = [];

    public updateCounts(count: number, coinCount: number): void {
        this.arrowCount = count;
        this.coinCount = coinCount;
        this.refreshUI();
    }

    public setCallbacks(
        onAttack?: () => void,
        onMove?: () => void,
        onArrow?: () => void,
        onSecret?: () => void,
        onRestart?: () => void
    ): void {
        this.onAttackModeClick = onAttack;
        this.onMoveModeClick = onMove;
        this.onArrowButtonClick = onArrow;
        this.onSecretButtonClick = onSecret;
        this.onRestartButtonClick = onRestart;
    }

    public addTerminalMessage(message: string): void {
        this.terminalMessages.push(message);
        if (this.terminalMessages.length > 5) {
            this.terminalMessages.shift();
        }
        this.refreshUI();
    }

    public setMode(mode: GameMode): void {
        this.currentMode = mode;
        this.refreshUI();
    }

    public init($container: JQuery): void {
        this.$container = $container;
        this.$container.hide();
        this.$container.html(uiTemplate);
        this.$imageArea = this.$container.find('[data-slot="image-area"]');
    }

    private refreshUI(): void {
        if (this.$arrowsCountEl) this.$arrowsCountEl.text(this.arrowCount);
        if (this.$coinsCountEl) this.$coinsCountEl.text(this.coinCount);
    }

    public getCellPositions(): { cx: number; cy: number }[] {
        return this.cellPositions;
    }
    private roomToCellIdx(room: number): number {
        const r = room - 1;
        const col = r % 6;
        const row = Math.floor(r / 6);
        return col * 5 + row;
    }

    public displayImage(imagePath: string): void {
        this.$imageArea.empty();
        this.cellPositions = [];
        this.$imageArea.css({
            'position': 'relative',
            'width': '900px',
            'height': '540px'
        });

        let posX = 190;
        for (let col = 0; col < 6; col++) {
            let posY = col % 2 === 0 ? 50 : 4;
            for (let row = 0; row < 5; row++) {
                const $imgElement = $('<img>', {
                    src: imagePath,
                    alt: 'Regular Hexagon Shape',
                    css: {
                        'position': 'absolute',
                        'width': '131px',
                        'height': '110px',
                        'left': posX + 'px',
                        'top': posY + 'px'
                    }
                });
                this.cellPositions.push({
                    cx: posX + 131 / 2,
                    cy: posY + 110 / 2
                });
                posY += 91;
                this.$imageArea.append($imgElement);
            }
            posX += 80;
        }

        const $arrows1 = $('<div>', { text: this.arrowCount }).css({
            'position': 'absolute',
            'left': '125px',
            'top': '110px',
            'color': 'white',
            'z-index': '20',
            'font-size': '36px',
            'font-weight': 'bold'
        });

        const $coins1 = $('<div>', { text: this.coinCount }).css({
            'position': 'absolute',
            'left': '835px',
            'top': '110px',
            'color': 'white',
            'z-index': '20',
            'font-size': '36px',
            'font-weight': 'bold'
        });

        const $attackButton = $('<img>', {
            src: attackingButtonUrl,
            alt: 'Attack Button',
            css: {
                'position': 'absolute',
                'width': '160px',
                'height': 'auto',
                'left': '15px',
                'top': '320px',
                'cursor': 'pointer',
                'border': this.currentMode === GameMode.ATTACK ? '3px solid yellow' : 'none'
            }
        }).on('click', () => {
            this.refreshUI();
            if (this.onAttackModeClick) this.onAttackModeClick();
            this.displayImage(imagePath);
        });

        const $moveButton = $('<img>', {
            src: movingButtonUrl,
            alt: 'Move Button',
            css: {
                'position': 'absolute',
                'width': '160px',
                'height': 'auto',
                'left': '725px',
                'top': '320px',
                'cursor': 'pointer',
                'border': this.currentMode === GameMode.MOVE ? '3px solid yellow' : 'none'
            }
        }).on('click', () => {
            this.currentMode = GameMode.MOVE;
            this.refreshUI();
            if (this.onMoveModeClick) this.onMoveModeClick();
            this.displayImage(imagePath);
        });

        const $arrowButton = $('<img>', {
            src: arrowIconUrl,
            alt: 'Buy Arrows',
            css: {
                'position': 'absolute',
                'width': '150px',
                'height': 'auto',
                'left': '20px',
                'top': '110px',
                'cursor': 'pointer'
            }
        }).on('click', () => {
            if (this.onArrowButtonClick) this.onArrowButtonClick();
        });

        const $secretButton = $('<img>', {
            src: secretButtonUrl,
            alt: 'Buy Secret',
            css: {
                'position': 'absolute',
                'width': '90px',
                'height': 'auto',
                'left': '20px',
                'top': '220px',
                'cursor': 'pointer',
                'z-index': '2000'
            }
        }).on('click', () => {
            if (this.onSecretButtonClick) this.onSecretButtonClick();
        });

        const $restartButton = $('<button>', {
            text: 'Restart',
            css: {
                'position': 'absolute',
                'width': '90px',
                'height': '36px',
                'left': '730px',
                'top': '230px',
                'cursor': 'pointer',
                'display': 'none',
                'z-index': '10000'
            }
        }).on('click', () => {
            if (this.onRestartButtonClick) this.onRestartButtonClick();
        });

        const $coinButton = $('<img>', {
            src: coinIconUrl,
            alt: 'Coins',
            css: {
                'position': 'absolute',
                'width': '150px',
                'height': 'auto',
                'left': '730px',
                'top': '110px'
            }
        });

        this.$imageArea.append($arrows1);
        this.$imageArea.append($coins1);
        this.$imageArea.append($attackButton);
        this.$imageArea.append($moveButton);
        this.$imageArea.append($arrowButton);
        this.$imageArea.append($secretButton);
        this.$imageArea.append($restartButton);
        this.$imageArea.append($coinButton);

        this.$arrowsCountEl = $arrows1;
        this.$coinsCountEl = $coins1;
        this.$restartButtonEl = $restartButton;

        this.positionPlayerOnCell();
        this.drawPlayerSprite();

        this.$container.show();
    }

    private positionPlayerOnCell(): void {
        if (this.cellPositions.length === 0 || this.playerRoom <= 0) return;

        const cellIdx = this.roomToCellIdx(this.playerRoom);
        const cell = this.cellPositions[cellIdx];
        if (!cell) return;

        this.currentCellIdx = cellIdx;
        this.playerPos = {
            x: cell.cx - this.playerPos.size / 2,
            y: cell.cy - this.playerPos.size / 2,
            size: this.playerPos.size
        };
    }

    private static readonly directionOffsets: Record<string, { dx: number; dy: number }> = {
        north: { dx: 0, dy: -91 },
        south: { dx: 0, dy: 91 },
        north_east: { dx: 80, dy: -45.5 },
        south_east: { dx: 80, dy: 45.5 },
        north_west: { dx: -80, dy: -45.5 },
        south_west: { dx: -80, dy: 45.5 },
    };

    public movePlayerInDirection(direction: string): void {
        if (this.currentCellIdx < 0 || this.cellPositions.length === 0) return;
        const offset = ImageScreen.directionOffsets[direction];
        if (!offset) return;

        const current = this.cellPositions[this.currentCellIdx];
        const targetX = current.cx + offset.dx;
        const targetY = current.cy + offset.dy;

        let bestIdx = this.currentCellIdx;
        let bestDist = Infinity;
        for (let i = 0; i < this.cellPositions.length; i++) {
            if (i === this.currentCellIdx) continue;
            const c = this.cellPositions[i];
            const d = (c.cx - targetX) ** 2 + (c.cy - targetY) ** 2;
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }

        const cell = this.cellPositions[bestIdx];
        this.currentCellIdx = bestIdx;
        this.playerPos = {
            x: cell.cx - this.playerPos.size / 2,
            y: cell.cy - this.playerPos.size / 2,
            size: this.playerPos.size
        };
        this.drawPlayerSprite();
    }

    private drawPlayerSprite(): void {
        this.$imageArea.find('img[alt="Game Entity Sprite"]').remove();
        displaySprite(this.$imageArea, playerUrl, this.playerPos.x, this.playerPos.y, this.playerPos.size);
    }

    public setPlayerRoom(room: number, roomCount: number): void {
        this.playerRoom = room;
        this.roomCount = roomCount;
        this.positionPlayerOnCell();
        if (this.cellPositions.length) this.drawPlayerSprite();
    }

    public displayPlayer(x: number, y: number, size: number = 80): void {
        this.playerPos = { x, y, size };
        this.drawPlayerSprite();
    }

    public setRestartVisible(visible: boolean): void {
        if (!this.$restartButtonEl) return;
        if (visible) {
            try {
                $('body').append(this.$restartButtonEl);
            } catch (e) { }
            try {
                const $term = $('[data-slot="terminal-ui"]').first();
                if ($term.length && $term.offset()) {
                    const off = $term.offset()!;
                    const left = off.left + ($term.outerWidth()! / 2);
                    this.$restartButtonEl.css({
                        position: 'fixed',
                        top: '585px',
                        left: `${left}px`,
                        transform: 'translateX(-50%)',
                        width: '90px',
                        height: '36px',
                        cursor: 'pointer',
                        'z-index': '10000',
                        display: 'block'
                    });
                }
            } catch (e) {
                this.$restartButtonEl.css({ display: 'block' });
            }
        } else {
            if (this.$imageArea?.length) this.$imageArea.append(this.$restartButtonEl);
            this.$restartButtonEl.css('display', 'none');
        }
    }
}