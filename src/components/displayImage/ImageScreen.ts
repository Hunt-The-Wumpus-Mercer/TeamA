import uiTemplate from './ImageScreen.html?raw';
import $ from 'jquery';
import { displaySprite } from './displaySprite';
//import { RoomNum, type MapObjectType } from "./IMap";
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
    // Index into cellPositions of the cell the player sprite currently sits on.
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

    public updateCounts(count: number, coinCount: number) {
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

    public displayImage(imagePath: string): void {
        
        this.$imageArea.empty(); 
        this.cellPositions = [];
        this.$imageArea.css({
            'position': 'relative',
            'width': '900px',
            'height': '540px'
        });
        let posY=40;
        let posX=190;
        let amountHex=5;
        for(let j=0;j<6; j++){
            if(j%2==0){
                posY=50;
       
                for(let i=0;i<amountHex; i++){
                    const $imgElement = $('<img>', {
                        src: imagePath,                  
                        alt: 'Regular Hexagon Shape',    
                        css: {
                            'position': 'absolute',
                            'width': '131px',            
                            'height': '110px',
                            'left': posX+'px',   
                            'top': posY+'px'  
                        }
                    });
                    this.cellPositions.push({ cx: posX + 131 / 2, cy: posY + 110 / 2 });
                    posY+=91;
                    this.$imageArea.append($imgElement);
                    this.$imageArea.append($imgElement);
                }
                //amountHex+=1;
                
            } else{
                posY=4;
                for(let i=0;i<5; i++){
                        const $imgElement = $('<img>', {
                            src: imagePath,                  
                            alt: 'Regular Hexagon Shape',    
                            css: {
                                'position': 'absolute',
                                'width': '131px',            
                                'height': '110px',
                                'left': posX+'px',   
                                'top': posY+'px'  
                            }
                        });
                        this.cellPositions.push({ cx: posX + 131 / 2, cy: posY + 110 / 2 });
                        posY+=91;
                        this.$imageArea.append($imgElement);
                        this.$imageArea.append($imgElement);
                    }
                //amountHex+=1;
                
            }
            posX+=80;
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
        
        const $coins1= $('<div>', { text: this.coinCount }).css({
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
                'border': this.currentMode === GameMode.ATTACK ? '3px solid yellow' : 'none',
                
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
            console.log('[DEBUG] Buy Arrows button click detected');
            if (this.onArrowButtonClick) {
                this.onArrowButtonClick();
            } else {
                console.log('[DEBUG] Arrow callback is not set');
            }
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
            console.log('[DEBUG] Buy Secret button click detected');
            if (this.onSecretButtonClick) {
                this.onSecretButtonClick();
            } else {
                console.log('[DEBUG] Secret callback is not set');
            }
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

        // Keep references so live updates (counts, terminal) can target these
        // elements without redrawing the whole board.
        this.$arrowsCountEl = $arrows1;
        this.$coinsCountEl = $coins1;
        this.$restartButtonEl = $restartButton;

        // Place the player sprite on its current hex cell and draw it last so it
        // sits on top of the grid and is re-added on every board redraw.
        this.positionPlayerOnCell();
        this.drawPlayerSprite();

        this.$container.show();//this is 
    }

    /**
     * Maps the player's current room number onto its hex cell. With a 30-room
     * cave and a 30-cell grid the mapping is 1:1 (room N -> cell N-1). If the
     * counts ever differ, rooms are spread proportionally across the cells.
     */
    private positionPlayerOnCell(): void {
        const cells = this.cellPositions.length;
        if (cells === 0 || this.roomCount <= 0 || this.playerRoom <= 0) return;
        const idx = this.roomCount === cells
            ? this.playerRoom - 1
            : Math.floor((this.playerRoom - 1) / this.roomCount * cells);
        const safeIdx = Math.max(0, Math.min(cells - 1, idx));
        const cell = this.cellPositions[safeIdx];
        this.currentCellIdx = safeIdx;
        this.playerPos = {
            x: cell.cx - this.playerPos.size / 2,
            y: cell.cy - this.playerPos.size / 2,
            size: this.playerPos.size
        };
    }

    /**
     * Pixel offsets (in image-area coordinates) that correspond to a single
     * step in each direction across the flat-top hex grid. Columns are 80px
     * apart and rows 91px apart, with diagonal neighbours half a row up/down.
     */
    private static readonly directionOffsets: Record<string, { dx: number; dy: number }> = {
        north: { dx: 0, dy: -91 },
        south: { dx: 0, dy: 91 },
        north_east: { dx: 80, dy: -45.5 },
        south_east: { dx: 80, dy: 45.5 },
        north_west: { dx: -80, dy: -45.5 },
        south_west: { dx: -80, dy: 45.5 },
    };

    /**
     * Moves the player sprite to the neighbouring hex cell that lies in the
     * given direction, so the on-screen movement always matches the announced
     * direction. Falls back to room-based placement if no current cell is known.
     */
    public movePlayerInDirection(direction: string): void {
        if (this.currentCellIdx < 0 || this.cellPositions.length === 0) return;
        const offset = ImageScreen.directionOffsets[direction];
        if (!offset) return;

        const current = this.cellPositions[this.currentCellIdx];
        const targetX = current.cx + offset.dx;
        const targetY = current.cy + offset.dy;

        // Pick the cell whose centre is closest to the target point, ignoring
        // the cell we're already on.
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

    /** Removes any existing player sprite, then draws it at playerPos. */
    private drawPlayerSprite(): void {
        this.$imageArea.find('img[alt="Game Entity Sprite"]').remove();
        displaySprite(this.$imageArea, playerUrl, this.playerPos.x, this.playerPos.y, this.playerPos.size);
    }

    /** Move the player sprite to the hex cell matching the given room. */
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
                const $body = $('body');
                $body.append(this.$restartButtonEl!);
            } catch (e) {
                // ignore if DOM not available
            }
            // position below the terminal if present
            try {
                const $term = $('[data-slot="terminal-ui"]').first();
                if ($term.length && $term.offset()) {
                    const off = $term.offset()!;
                    const terminalTop = off.top + $term.outerHeight()! + 80;
                    const left = off.left! + ($term.outerWidth()! / 2);
                    const buttonHeight = 36;
                    const winH = (window && window.innerHeight) ? window.innerHeight : ($(window).height() || 0);
                    const fallbackTop = winH - 60 - buttonHeight;

                    // Choose the lower (visually lower on screen) of the two placements
                    if (terminalTop > fallbackTop) {
                        this.$restartButtonEl.css({
                            position: 'fixed',
                            top: `${terminalTop}px`,
                            left: `${left}px`,
                            transform: 'translateX(-50%)',
                            width: '90px',
                            height: `${buttonHeight}px`,
                            cursor: 'pointer',
                            'z-index': '10000',
                            display: 'block'
                        });
                    } else {
                        this.$restartButtonEl.css({
                            position: 'fixed',
                            bottom: '60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90px',
                            height: `${buttonHeight}px`,
                            cursor: 'pointer',
                            'z-index': '10000',
                            display: 'block'
                        });
                    }
                } else {
                    this.$restartButtonEl.css({
                        position: 'fixed',
                        bottom: '60px',
                        left: '50%',
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
            if (this.$imageArea && this.$imageArea.length) {
                this.$imageArea.append(this.$restartButtonEl);
            }
            this.$restartButtonEl.css('display', 'none');
        }
    }
}