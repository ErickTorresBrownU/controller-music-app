import { useEffect, useState, useRef } from "react";
import "./App.css";

const App = () => {
    const [buttonStates, setButtonStates] = useState<Map<ControllerButtonKind, number>>(new Map());
    const gamepadRef = useRef<Gamepad | null>(null);
    const lastTriggerValue = useRef({ left: 0, right: 0 });

    function gamepadLoop() {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[0];

        if (!gamepad) return;

        gamepadRef.current = gamepad; // Store gamepad reference

        // Track button states
        const newButtonStates = new Map<ControllerButtonKind, number>();

        gamepad.buttons.forEach((button, index) => {
            if (Object.values(ControllerButtonKind).includes(index)) {
                newButtonStates.set(index as ControllerButtonKind, button.pressed ? 1 : button.value);
            }
        });

        // Detect trigger changes (only update when value changes significantly)
        const leftTrigger = gamepad.buttons[6]?.value ?? 0;
        const rightTrigger = gamepad.buttons[7]?.value ?? 0;

        if (Math.abs(leftTrigger - lastTriggerValue.current.left) > 0.1) {
            lastTriggerValue.current.left = leftTrigger;
            console.log(`Left Trigger: ${leftTrigger}`);
        }

        if (Math.abs(rightTrigger - lastTriggerValue.current.right) > 0.1) {
            lastTriggerValue.current.right = rightTrigger;
            console.log(`Right Trigger: ${rightTrigger}`);
        }

        // Update state only if it has changed
        setButtonStates(prevStates => {
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
                {Object.values(ControllerButtonKind).filter(Number.isInteger).map(buttonKind => (
                    <ControllerButton
                        key={buttonKind}
                        buttonKind={buttonKind as ControllerButtonKind}
                        pressed={buttonStates.get(buttonKind as ControllerButtonKind) ?? 0}
                    />
                ))}
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

enum ControllerButtonKind {
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
