import uiTemplate from './ImageScreen.html?raw';
import $ from 'jquery';
import { displaySprite } from './displaySprite';
//import { RoomNum, type MapObjectType } from "./IMap";
import attackingButtonUrl from '../../images/attackingButton.png';
import movingButtonUrl from '../../images/movingButton.png';
import arrowIconUrl from '../../images/arrowIcon.png';
import coinIconUrl from '../../images/coinIcon.png';
//import { PlayerResourceType } from '../../components/IPlayer';

export class ImageScreen {
    private $container!: JQuery;
    private $imageArea!: JQuery;

    public init($container: JQuery): void {
        this.$container = $container;         
        this.$container.hide();               
        this.$container.html(uiTemplate);     
        this.$imageArea = this.$container.find('[data-slot="image-area"]');
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
        //const arrowCount = player.getResource("arrows");
        const $arrows1 = $('<div>', { text: '3' }).css({
            'position': 'absolute', 
            'left': '250px', 
            'top': '-38px', 
            'color': 'white',
            'z-index': '20',
            'font-size': '36px',       
            'font-weight': 'bold'    
        });
        const $coins1= $('<div>', { text: '100' }).css({
            'position': 'absolute', 
            'left': '450px', 
            'top': '-38px', 
            'color': 'white',
            'z-index': '20',
            'font-size': '36px',       
            'font-weight': 'bold'    
        });
        displaySprite(this.$imageArea, attackingButtonUrl, 100, 400,225); //1. x position 2. y position 3. size
        displaySprite(this.$imageArea, movingButtonUrl, 380, 400,200);
        displaySprite(this.$imageArea, arrowIconUrl, 100, -50,200);
        displaySprite(this.$imageArea, coinIconUrl, 350, -50,200);
        this.$imageArea.append($arrows1);
        this.$imageArea.append($coins1);
        this.$container.show();//this is 
    }
}