import {type ISoundManager} from "./ISoundManager";
import {SoundEventType} from "./ISoundManager";

import walkSound from "./sound_resources/u_3x9ga8wevj-walking-sound-effect-272246.mp3";
import arrowSound from "./sound_resources/djartmusic-arrow-swish_03-306040.mp3";
import winSound from "./sound_resources/mrstokes302-you-win-sfx-mrstokes302-442128.mp3";
import loseSound from "./sound_resources/mrstokes302-you-lose-sfx-mrstokes302-528744.mp3";
import batSound from "./sound_resources/dragon-studio-bird-wings-463212.mp3";
import pitSound from "./sound_resources/dragon-studio-droplets-in-a-cave-482871.mp3";
import growlSound from "./sound_resources/dragon-studio-monster-growl-376892.mp3";

export default class SoundManager implements ISoundManager {
    
    playSound(soundEventType: SoundEventType): void {

        let path = ""
        switch (soundEventType) {
            case SoundEventType.WALK: {
                path = walkSound
                break;
            }

            case SoundEventType.SHOOT_ARROW: {
                path = arrowSound;
                break;
            }

            case SoundEventType.WIN: {
                path = winSound;
                break;
            }

            case SoundEventType.LOSE: {
                path = loseSound;
                break;
            }

            case SoundEventType.WARNING_BAT: {
                path = batSound;
                break;
            }

            case SoundEventType.WARNING_PIT: {
                path = pitSound;
                break;
            }
            case SoundEventType.WARNING_BAT: {
                path = growlSound;
                break;
            }
        }

        const audio = new Audio(path);
        audio.play().catch(error => {
                console.error("Audio playback failed. Note: Browsers block sound until the user interacts with the page.", error);
            });
    }
    
    
}
