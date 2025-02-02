import { BaseModalProps } from "./modals";

interface PromptModalProps extends BaseModalProps {
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const SettingsMenuModal: FC<PromptModalProps> = ({
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