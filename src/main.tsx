import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { Command } from '@tauri-apps/plugin-shell';

async function runSidecar() {
    const message = 'Tauri';
    const command = Command.sidecar('binaries/app', ['ping', message]);

    const output = await command.execute();
    console.log('Sidecar response:', output.stdout);
}

runSidecar();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
