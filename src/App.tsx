import { useEffect, useState, useRef } from "react";
import "./App.css";
import { buttonDown, buttonUp, player } from "./musicplayer";
import { useModals } from "./modals";
import { Game } from 'phaser';
import { gameConfig } from "./game";
import { ClickerGame } from "./scenes/ClickerGame";
import { SettingsMenuModal } from "./SettingsMenuModal";

const App = () => {
    const [buttonStates, setButtonStates] = useState<Map<ControllerButtonKind, number>>(new Map());
    const gamepadRef = useRef<Gamepad | null>(null);
    const gameRef = useRef<Game | null>(null);

    // Map to track pressed states for each button
    const buttonPressedLock = useRef<Map<ControllerButtonKind, boolean>>(new Map());

    const { showModal } = useModals();

    function gamepadLoop() {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[0];

        if (!gamepad) return;

        gamepadRef.current = gamepad; // Store gamepad reference

        // Track button states
        const newButtonStates = new Map<ControllerButtonKind, number>();
        gamepad.buttons.forEach((button, index) => {
            if (Object.values(ControllerButtonKind).includes(index)) {
                newButtonStates.set(index as ControllerButtonKind, button.pressed ? button.value : 0);
            }
        });

        // Handle buttons like A and X
        [ControllerButtonKind.A, ControllerButtonKind.X].forEach((buttonKind) => {
            const isPressed = (newButtonStates.get(buttonKind) ?? 0) > 0;
            const wasPressed = buttonPressedLock.current.get(buttonKind) || false;

            if (isPressed && !wasPressed) {
                // Button just got pressed
                buttonPressedLock.current.set(buttonKind, true);

                // Read joystick position
                const leftStickY = gamepad.axes[1];

                const mappedValue = Math.round(((-leftStickY + 1) / 2) * 8);

                console.log(`Joystick X: ${leftStickY}, Mapped Value: ${mappedValue}`);

                buttonDown(mappedValue, buttonKind);

                if (!gameRef.current) return;
                const clickerGame = gameRef.current.scene.getScene('ClickerGame') as ClickerGame;

                console.log(`Joystick Y: ${leftStickY}`);

                const threshold = 0.2; // Adjust for joystick drift (0.01 is too small)
                if (leftStickY < -threshold) {
                    console.log("Queueing Move Up");
                    clickerGame.moveUp();
                } else if (leftStickY > threshold) {
                    console.log("Queueing Move Down");
                    clickerGame.moveDown();
                }
            }

            if (!isPressed && wasPressed) {
                buttonPressedLock.current.set(buttonKind, false);
                console.log(`Button ${buttonKind} released`);
                buttonUp(buttonKind);
            }
        });

        // Example: Adjust sustain strength using the right trigger
        player.setSustainStrength(newButtonStates.get(ControllerButtonKind.RT) ?? 0);

        // Update state only if it has changed
        setButtonStates((prevStates) => {
            if (areMapsEqual(prevStates, newButtonStates)) return prevStates;
            return new Map(newButtonStates);
        });

        // Ensure continuous polling of gamepad
        requestAnimationFrame(gamepadLoop);
    }


    useEffect(() => {
        const onGamepadConnected = (e: GamepadEvent) => {
            console.log(`Gamepad connected: ${e.gamepad.id}`);
            gamepadLoop();
        };

        window.addEventListener("gamepadconnected", onGamepadConnected);

        const game = new Game(gameConfig);

        // Load and play the background music
        game.scene.add('BackgroundMusic', {
            preload: function () {
                this.load.audio('backgroundMusic', 'Funk Guitar Backing Track in C Minor.mp3');
            },
            create: function () {
                const music = this.sound.add('backgroundMusic', { loop: true, volume: 0.05 });
                music.play();
            }
        });

        game.scene.start('BackgroundMusic');
        gameRef.current = game;

        return () => window.removeEventListener("gamepadconnected", onGamepadConnected);
    }, []);

    return (
        <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
            <div className="absolute inset-0" id="game-container"></div>
            <div className="absolute right-5 bottom-5 pointer-events-none">
                <button
                    type="button"
                    className="bg-gray-200 rounded-md p-2 pointer-events-auto"
                    onClick={() => {
                        showModal(<SettingsMenuModal title="Settings" />);
                    }}
                >
                    Settings
                </button>
            </div>
        </div>
    );
};




// Helper function to compare two Maps
function areMapsEqual(map1: Map<unknown, unknown>, map2: Map<unknown, unknown>): boolean {
    if (map1.size !== map2.size) return false;
    for (const [key, value] of map1) {
        if (map2.get(key) !== value) return false;
    }
    return true;
}

export enum ControllerButtonKind {
    A = 0,
    B = 1,
    X = 2,
    Y = 3,
    LB = 4,
    RB = 5,
    LT = 6,
    RT = 7,
    L3 = 8,
    R3 = 9
}

type ControllerButtonProps = {
    buttonKind: ControllerButtonKind;
    pressed: number;
};

const buttonInfo: Record<
    ControllerButtonKind,
    { label: string; backgroundColor: string; highlightColor: string; ringColor: string }
> = {
    [ControllerButtonKind.A]: { label: "A", backgroundColor: "#043f04", highlightColor: "#107C10", ringColor: "#0c5a0c" },
    [ControllerButtonKind.B]: { label: "B", backgroundColor: "#480B0B", highlightColor: "#C81D11", ringColor: "#8A1818" },
    [ControllerButtonKind.X]: { label: "X", backgroundColor: "#0B1F48", highlightColor: "#1C52A2", ringColor: "#14387A" },
    [ControllerButtonKind.Y]: { label: "Y", backgroundColor: "#4A3700", highlightColor: "#FDBD01", ringColor: "#A68000" },
    [ControllerButtonKind.LB]: { label: "LB", backgroundColor: "#2C2C2C", highlightColor: "#CCCCCC", ringColor: "#6D6D6D" },
    [ControllerButtonKind.RB]: { label: "RB", backgroundColor: "#2C2C2C", highlightColor: "#CCCCCC", ringColor: "#6D6D6D" },
    [ControllerButtonKind.LT]: { label: "LT", backgroundColor: "#222222", highlightColor: "#666666", ringColor: "#444444" },
    [ControllerButtonKind.RT]: { label: "RT", backgroundColor: "#222222", highlightColor: "#666666", ringColor: "#444444" },
    [ControllerButtonKind.L3]: { label: "L3", backgroundColor: "#1A1A1A", highlightColor: "#444444", ringColor: "#333333" },
    [ControllerButtonKind.R3]: { label: "R3", backgroundColor: "#1A1A1A", highlightColor: "#444444", ringColor: "#333333" },
};

const ControllerButton: React.FC<ControllerButtonProps> = ({ buttonKind, pressed }) => {
    const { label, backgroundColor, highlightColor, ringColor } = buttonInfo[buttonKind];

    return (
        <div
            className="flex select-none items-center justify-center size-10 rounded-full font-bold shadow-lg transition-all"
            style={{
                backgroundColor: pressed > 0 ? highlightColor : backgroundColor,
                boxShadow: pressed > 0 ? `0 0 ${5 + 10 * pressed}px ${highlightColor}` : `0 0 5px ${ringColor}`,
                transform: `scale(${1 + 0.1 * pressed})`,
                border: `2px solid ${pressed > 0 ? highlightColor : ringColor}`,
                transition: "background-color 0.1s ease, transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease",
            }}
        >
            {label}
        </div>
    );
};

export default App;
