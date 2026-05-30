import { ImageScreen } from './ImageScreen';
import $ from 'jquery';

// We use '../../' to go up two folders to step out of components and reach /src/images/
import hexagonSvgUrl from '../../images/Regular_hexagon.svg?url';

export function runHexagonDemo(): void {
    const hexagonScreen = new ImageScreen();
    
    // Target the main application container element
    hexagonScreen.init($('#app'));

    // Pass the correctly resolved URL to the screen
    hexagonScreen.displayImage(hexagonSvgUrl);
}