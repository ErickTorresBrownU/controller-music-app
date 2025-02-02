import { createContext, FC, useContext, useState } from "react";

interface ModalContextInterface {
    showModal: (modal: JSX.Element) => void;
    modal?: JSX.Element;
    popModal: () => void;
}

const ModalContext = createContext<ModalContextInterface>(undefined as any);

export const useModals = () => useContext(ModalContext);

export const ModalProvider: FC = ({ children }) => {
    const [modal, setModal] = useState<JSX.Element | undefined>(undefined);

    const popModal = () => setModal(undefined);
    const showModal = (modal: JSX.Element) => setModal(modal);

    return (
        <ModalContext.Provider value={{ modal, showModal, popModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export interface BaseModalProps {
    title: string;
    bodyText: string;
}

interface PromptModalProps extends BaseModalProps {
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface AlertModalProps extends BaseModalProps {
    onAcknowledge?: () => void;
    acknowledgeText?: string;
}

/* ✨ Prompt Modal */
export const PromptModal: FC<PromptModalProps> = ({
    title,
    bodyText,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {
    const { popModal } = useModals();

    return (
        <div className="w-5/12 rounded-xl border-2 border-gray-300 bg-white p-8 shadow-lg">
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            <p className="mt-4 text-gray-700">{bodyText}</p>

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

/* ✨ Alert Modal */
export const AlertModal: FC<AlertModalProps> = ({
    title,
    bodyText,
    onAcknowledge,
    acknowledgeText = "Okay",
}) => {
    const { popModal } = useModals();

    return (
        <div className="w-5/12 rounded-xl border-2 border-gray-300 bg-white p-8 shadow-lg">
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            <p className="mt-4 text-gray-700">{bodyText}</p>
            <button
                className="mt-8 flex w-full items-center justify-center rounded-md border-2 border-blue-600 bg-blue-600 px-6 py-2 text-white transition duration-200 hover:bg-blue-700"
                onClick={() => {
                    onAcknowledge?.();
                    popModal();
                }}
            >
                {acknowledgeText}
            </button>
        </div>
    );
};

/* ✨ Modal Container */
export const ModalContainer = () => {
    const { modal } = useModals();

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${modal ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
        >
            <div className="absolute inset-0 bg-black opacity-50" />
            <div className="relative z-10">{modal}</div>
        </div>
    );
};
