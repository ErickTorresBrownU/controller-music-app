import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

import { Buffer } from "buffer";
import { ModalContainer, ModalProvider } from './modals.tsx';

globalThis.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ModalProvider>
        <App />
        <ModalContainer />
    </ModalProvider>
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
})
