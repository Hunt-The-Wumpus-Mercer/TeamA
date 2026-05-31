import uiTemplate from './ImageScreen.html?raw';
import $ from 'jquery';
import { displaySprite } from './displaySprite';
//import { RoomNum, type MapObjectType } from "./IMap";
import attackingButtonUrl from '../../images/attackingButton.png';
import movingButtonUrl from '../../images/movingButton.png';
import arrowIconUrl from '../../images/arrowIcon.png';
import coinIconUrl from '../../images/coinIcon.png';
import playerUrl from '../../images/Player.png';
//import { PlayerResourceType } from '../../components/IPlayer';

export class ImageScreen {
    private arrowCount = 0;
    private coinCount = 0;
    private $container!: JQuery;
    private $imageArea!: JQuery;
    private currentMode: 'move' | 'attack' = 'move';
    private onAttackModeClick?: () => void;
    private onMoveModeClick?: () => void;
    private onArrowButtonClick?: () => void;
    private terminalMessages: string[] = [];

    public updateCounts(count: number, coinCount: number) {
        this.arrowCount = count;
        this.coinCount = coinCount;
        this.refreshUI();
    }

    public setCallbacks(
        onAttack?: () => void,
        onMove?: () => void,
        onArrow?: () => void
    ): void {
        this.onAttackModeClick = onAttack;
        this.onMoveModeClick = onMove;
        this.onArrowButtonClick = onArrow;
    }

    public addTerminalMessage(message: string): void {
        this.terminalMessages.push(message);
        if (this.terminalMessages.length > 5) {
            this.terminalMessages.shift();
        }
        this.refreshUI();
    }

    public setMode(mode: 'move' | 'attack'): void {
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
        // Update the displayed counts
        const $arrows = this.$imageArea.find('[data-arrows-count]');
        const $coins = this.$imageArea.find('[data-coins-count]');
        if ($arrows.length) $arrows.text(this.arrowCount);
        if ($coins.length) $coins.text(this.coinCount);
    }

    public displayImage(imagePath: string): void {
        
        this.$imageArea.empty(); 
        this.$imageArea.css({
            'position': 'relative',
            'width': '100%',
            'height': '500px'
        });
        let posY=40;
        let posX=-550;
        let amountHex=5;
        for(let j=0;j<6; j++){
            if(j%2==0){
                posY=6;
       
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
                    posY+=91;
                    this.$imageArea.append($imgElement);
                    this.$imageArea.append($imgElement);
                }
                //amountHex+=1;
                
            } else{
                posY=-41;
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
            'left': '250px', 
            'top': '-38px', 
            'color': 'white',
            'z-index': '20',
            'font-size': '36px',       
            'font-weight': 'bold'    
        });
        
        const $coins1= $('<div>', { text: this.coinCount }).css({
            'position': 'absolute', 
            'left': '450px', 
            'top': '-38px', 
            'color': 'white',
            'z-index': '20',
            'font-size': '36px',       
            'font-weight': 'bold'    
        });

        // Create attack button with click handler
        const $attackButton = $('<img>', {
            src: attackingButtonUrl,
            alt: 'Attack Button',
            css: {
                'position': 'absolute',
                'width': '225px',
                'height': 'auto',
                'left': '100px',
                'top': '400px',
                'cursor': 'pointer',
                'border': this.currentMode === 'attack' ? '3px solid yellow' : 'none'
            }
        }).on('click', () => {
            this.currentMode = 'attack';
            this.refreshUI();
            if (this.onAttackModeClick) this.onAttackModeClick();
            this.displayImage(imagePath);
        });

        // Create move button with click handler
        const $moveButton = $('<img>', {
            src: movingButtonUrl,
            alt: 'Move Button',
            css: {
                'position': 'absolute',
                'width': '200px',
                'height': 'auto',
                'left': '380px',
                'top': '400px',
                'cursor': 'pointer',
                'border': this.currentMode === 'move' ? '3px solid yellow' : 'none'
            }
        }).on('click', () => {
            this.currentMode = 'move';
            this.refreshUI();
            if (this.onMoveModeClick) this.onMoveModeClick();
            this.displayImage(imagePath);
        });

        // Create terminal display between attack and arrow buttons
        const terminalText = this.terminalMessages.join('<br>');
        const $terminal = $('<div>', {
            html: terminalText || 'Terminal ready...',
            css: {
                'position': 'absolute',
                'left': '220px',
                'top': '405px',
                'width': '140px',
                'height': '60px',
                'background': '#222',
                'color': '#0f0',
                'padding': '5px',
                'font-size': '10px',
                'overflow': 'auto',
                'border': '1px solid #0f0',
                'z-index': '15'
            }
        });

        // Create arrow button with click handler
        const $arrowButton = $('<img>', {
            src: arrowIconUrl,
            alt: 'Buy Arrows',
            css: {
                'position': 'absolute',
                'width': '200px',
                'height': 'auto',
                'left': '100px',
                'top': '-50px',
                'cursor': 'pointer'
            }
        }).on('click', () => {
            if (this.onArrowButtonClick) this.onArrowButtonClick();
        });

        // Create coin icon
        const $coinButton = $('<img>', {
            src: coinIconUrl,
            alt: 'Coins',
            css: {
                'position': 'absolute',
                'width': '200px',
                'height': 'auto',
                'left': '350px',
                'top': '-50px'
            }
        });

        this.$imageArea.append($arrows1);
        this.$imageArea.append($coins1);
        this.$imageArea.append($attackButton);
        this.$imageArea.append($moveButton);
        this.$imageArea.append($terminal);
        this.$imageArea.append($arrowButton);
        this.$imageArea.append($coinButton);
        this.$container.show();//this is 
    }
    
    public displayPlayer(x: number, y: number, size: number = 80): void {
        displaySprite(this.$imageArea, playerUrl, x, y, size);
    }
}