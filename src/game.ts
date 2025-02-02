import { Boot } from './scenes/Boot';
import { ClickerGame } from './scenes/ClickerGame';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

// Game configuration with dynamic resizing
export const gameConfig = {
    type: Phaser.AUTO,
    width: '100%',  // Set the width to a percentage of the container
    height: '100%', // Set the height to a percentage of the container
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,         // Fit the game to the container
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game within the container
        width: window.innerWidth,       // Set initial width based on the window size
        height: window.innerHeight,     // Set initial height based on the window size
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        ClickerGame,
        GameOver
    ],
    audio: {
        disableWebAudio: true
    },
};
