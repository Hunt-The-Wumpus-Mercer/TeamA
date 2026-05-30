import uiTemplate from './ImageScreen.html?raw';
import $ from 'jquery';
//import { RoomNum, type MapObjectType } from "./IMap";

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
            'width': '80%',
            'height': '480px'
        });
        let posY=100;
        let posX=-500;
        let amountHex=5;
        for(let j=0;j<7; j++){
            if(j%2==0){
                posY=100;
       
                for(let i=0;i<amountHex; i++){
                    const $imgElement = $('<img>', {
                        src: imagePath,                  
                        alt: 'Regular Hexagon Shape',    
                        css: {
                            'position': 'absolute',
                            'width': '120px',            
                            'height': '100px',
                            'left': posX+'px',   
                            'top': posY+'px'  
                        }
                    });
                    posY+=84;
                    this.$imageArea.append($imgElement);
                    this.$imageArea.append($imgElement);
                }
                //amountHex+=1;
                
            } else{
                posY=59;
                for(let i=0;i<5; i++){
                        const $imgElement = $('<img>', {
                            src: imagePath,                  
                            alt: 'Regular Hexagon Shape',    
                            css: {
                                'position': 'absolute',
                                'width': '120px',            
                                'height': '100px',
                                'left': posX+'px',   
                                'top': posY+'px'  
                            }
                        });
                        posY+=84;
                        this.$imageArea.append($imgElement);
                        this.$imageArea.append($imgElement);
                    }
                //amountHex+=1;
                
            }
            posX+=71;
        }
        this.$container.show();//this is 
    }
}