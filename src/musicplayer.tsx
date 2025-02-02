import * as mm from "@magenta/music";
import Soundfont from "soundfont-player";

export const CONSTANTS = {
    COLORS: ['#EE2B29', '#ff9800', '#ffff00', '#c6ff00', '#00e5ff', '#2979ff', '#651fff', '#d500f9'],
    NUM_BUTTONS: 8,
    NOTES_PER_OCTAVE: 12,
    WHITE_NOTES_PER_OCTAVE: 7,
    LOWEST_PIANO_KEY_MIDI_NOTE: 21,
    GENIE_CHECKPOINT: 'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006',
    SOUNDFONT_URL: 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus',
};

export class Player {
    private audioContext: AudioContext;
    private instrument: any | null = null;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.loadSoundFont();
    }

    async loadSoundFont() {
        try {
            this.instrument = await Soundfont.instrument(this.audioContext, "acoustic_grand_piano", {
                soundfont: CONSTANTS.SOUNDFONT_URL,
            });
            console.log("✅ SoundFont loaded successfully");
        } catch (error) {
            console.error("⚠️ Error loading SoundFont:", error);
        }
    }

    async playNoteDown(pitch: number) {
        if (this.instrument) {
            this.instrument.play(pitch, this.audioContext.currentTime, { duration: 1 });
        } else {
            console.warn("⚠️ SoundFont not loaded yet.");
        }
    }
}

class PianoGenie {
    private genie: mm.PianoGenie | null = null;

    async loadModel() {
        try {
            this.genie = new mm.PianoGenie(CONSTANTS.GENIE_CHECKPOINT);
            await this.genie.initialize();
            console.log("✅ Piano Genie model loaded successfully.");
        } catch (error) {
            console.error("⚠️ Error loading Piano Genie model:", error);
        }
    }

    async nextNote(button: number): Promise<number> {
        if (!this.genie) {
            console.warn("⚠️ Piano Genie model not loaded yet.");
            return 60; // Default to Middle C
        }

        // Use Magenta.js to get the next note
        const note = this.genie.next(button);
        return note;
    }
}

const player = new Player();
const genie = new PianoGenie();

async function initialize() {
    await genie.loadModel();
}
initialize();

export async function buttonDown(button: number) {
    if (!genie) {
        console.warn("⚠️ Piano Genie is not ready yet.");
        return;
    }

    const note = await genie.nextNote(button);
    const pitch = CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + note;
    player.playNoteDown(pitch);

    console.log(`🎶 Playing note: ${pitch} (MIDI) from button ${button}`);
}
