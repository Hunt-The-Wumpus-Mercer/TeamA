import "./style.css";
import { GameControl } from "./components/game_control/GameControl";

// init() renders the setup screen and starts the game (loading the cave and
// wiring up all graphics) once the player clicks "Start Game". Calling
// startGame() here would run before a cave is loaded and crash.
const gameControl = new GameControl();
gameControl.init("#app");
