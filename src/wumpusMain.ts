import "./style.css";
import { GameControl } from "./components/game_control/GameControl";

const gameControl = new GameControl();
gameControl.init("#app");
gameControl.startGame();
