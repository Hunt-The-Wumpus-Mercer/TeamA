import $ from 'jquery';
export function displaySprite($imageArea: JQuery, spritePath: string, targetX: number, targetY: number, width: number): void {
    const $spriteElement = $('<img>', {
        src: spritePath,                  
        alt: 'Game Entity Sprite',    
        css: {
            'position': 'absolute',
            'width': width+'px',      
            'height': 'auto',
            'left': targetX + 'px',   
            'top': targetY + 'px',
            'z-index': '10'
        }
    });

    $imageArea.append($spriteElement);
}