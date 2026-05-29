import uiTemplate from './ImageScreen.html?raw';
import $ from 'jquery';

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
            'height': '480px' // Give it a fixed height so the absolute items have space to live
        });
        // Create a proper image tag element
        let posY=-100;
        let posX=-500;
        let amountHex=5;
        for(let j=0;j<9; j++){
            if(j<4){
                if(j%2==1){
                    posY+=21;
                } else{
                    posY-=21;
                }
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
                }
                amountHex+=1;
                
                
            } else{
                posY-=42;
                for(let i=0;i<7; i++){
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
                    }   
            }
            if(j<4){
                posY=-100-(j*100)
            }else{
                posY=-100;
            }
            
            posX+=71;
        }
        this.$container.show();
    }
}