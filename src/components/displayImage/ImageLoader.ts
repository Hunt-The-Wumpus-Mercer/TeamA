import { ImageScreen } from './ImageScreen';
import $ from 'jquery';
import hexagonSvgUrl from '../../images/Regular_hexagon.svg?url';

export function runHexagonDemo(): void {
    const hexagonScreen = new ImageScreen();
    hexagonScreen.init($('#app'));

    hexagonScreen.displayImage(hexagonSvgUrl);
}

export function initGameDisplay(containerSelector: string): ImageScreen {
    const hexagonScreen = new ImageScreen();
    hexagonScreen.init($(containerSelector));
    hexagonScreen.displayImage(hexagonSvgUrl);
    
    return hexagonScreen;
}