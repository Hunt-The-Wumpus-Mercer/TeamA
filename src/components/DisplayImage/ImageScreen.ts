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

        // Create a proper image tag element
        const $imgElement = $('<img>', {
            src: imagePath,                  
            alt: 'Regular Hexagon Shape',    
            css: {
                'width': '300px',            
                'height': 'auto',           
                'margin': '20px auto'        
            }
        });

        this.$imageArea.append($imgElement);
        this.$container.show();
    }
}