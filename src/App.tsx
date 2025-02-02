import { useEffect, useState, useRef, FC } from "react";
import "./App.css";
import { buttonDown, buttonUp, player } from "./musicplayer";
import { BaseModalProps, PromptModal, useModals } from "./modals";
import { InstrumentName } from "soundfont-player";

interface PromptModalProps extends BaseModalProps {
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

const SettingsMenuModal: FC<PromptModalProps> = ({
    title,
    bodyText,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {
    const { popModal } = useModals();
    const [instruments, setInstruments] = useState<string[]>([]);

    useEffect(() => {
        fetch("https://gleitz.github.io/midi-js-soundfonts/MusyngKite/names.json").then((res) => res.json()).then(json => setInstruments(json))
    }, [])

    return (
        <div className="w-[5/12] rounded-xl border-2 border-gray-300 bg-white p-8 shadow-lg">
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            <p className="mt-4 text-gray-700">{bodyText}</p>
            <select
                onChange={(e) => {
                    const selectedInstrument = e.target.value;
                    console.log("Selected:", selectedInstrument);
                    player.loadSoundFont(selectedInstrument as InstrumentName);
                }}
            >
                <option value="" disabled selected>Select an instrument</option>
                {instruments.map((instrument) => (
                    <option key={instrument} value={instrument}>
                        {instrument}
                    </option>
                ))}
            </select>

            <div className="mt-8 flex flex-row space-x-4">
                <button
                    className="flex w-full items-center justify-center rounded-md border-2 border-gray-300 bg-gray-100 px-6 py-2 text-gray-800 transition duration-200 hover:bg-gray-200"
                    onClick={() => {
                        onCancel?.();
                        popModal();
                    }}
                >
                    {cancelText}
                </button>
                <button
                    className="flex w-full items-center justify-center rounded-md border-2 border-blue-600 bg-blue-600 px-6 py-2 text-white transition duration-200 hover:bg-blue-700"
                    onClick={() => {
                        onConfirm?.();
                        popModal();
                    }}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    );
};

const App = () => {
    const [buttonStates, setButtonStates] = useState<Map<ControllerButtonKind, number>>(new Map());
    const gamepadRef = useRef<Gamepad | null>(null);

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
                const leftStickX = gamepad.axes[0];

                // Map joystick value from -1 to 1 -> 0 to 8
                const mappedValue = Math.round(((leftStickX + 1) / 2) * 8);

                console.log(`Joystick X: ${leftStickX}, Mapped Value: ${mappedValue}`);

                // Call buttonDown with the mapped value and button kind
                buttonDown(mappedValue, buttonKind);
            }

            if (!isPressed && wasPressed) {
                // Button was just released
                buttonPressedLock.current.set(buttonKind, false);

                console.log(`Button ${buttonKind} released`);
                // Call buttonUp for the released button
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

        requestAnimationFrame(gamepadLoop);
    }

    useEffect(() => {
        const onGamepadConnected = (e: GamepadEvent) => {
            console.log(`Gamepad connected: ${e.gamepad.id}`);
            gamepadLoop();
        };

        window.addEventListener("gamepadconnected", onGamepadConnected);
        return () => window.removeEventListener("gamepadconnected", onGamepadConnected);
    }, []);

    return (
        <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
            <div className="flex flex-row items-center space-x-2">
                {Object.values(ControllerButtonKind)
                    .filter(Number.isInteger)
                    .map((buttonKind) => (
                        <ControllerButton
                            key={buttonKind}
                            buttonKind={buttonKind as ControllerButtonKind}
                            pressed={buttonStates.get(buttonKind as ControllerButtonKind) ?? 0}
                        />
                    ))}
                <button
                    type="button"
                    onClick={() => {
                        showModal(<SettingsMenuModal title="Settings" />);
                    }}
                >
                    Click me!
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
