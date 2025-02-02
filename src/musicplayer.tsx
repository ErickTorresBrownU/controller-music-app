import * as mm from "@magenta/music";
import Soundfont, { InstrumentName } from "soundfont-player";
import { ControllerButtonKind } from "./App";

export const CONSTANTS = {
    COLORS: ['#EE2B29', '#ff9800', '#ffff00', '#c6ff00', '#00e5ff', '#2979ff', '#651fff', '#d500f9'],
    NUM_BUTTONS: 8,
    NOTES_PER_OCTAVE: 12,
    WHITE_NOTES_PER_OCTAVE: 7,
    LOWEST_PIANO_KEY_MIDI_NOTE: 21,
    GENIE_CHECKPOINT: 'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006',
    SOUNDFONT_URL: 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus',
};

const TOTAL_NOTES: number = 127;
const keyWhitelist: number[] = Array.from({ length: TOTAL_NOTES + 1 }).map((_, i) => i);


// export class Player {
//     private player = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');

//     constructor() {
//         this.loadSoundFont();

//         this.loadAllSamples();
//     }

//     async loadAllSamples() {
//         const seq: { notes: { pitch: number }[] } = { notes: [] };

//         for (let i = 0; i < 96; i++) {
//             seq.notes.push({ pitch: CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + i })
//         }

//         await this.player.loadSamples(seq);
//     }

//     async loadSoundFont() {
//         try {
//             this.player = new mm.SoundFontPlayer(CONSTANTS.SOUNDFONT_URL);
//             console.log("✅ SoundFont loaded successfully");
//         } catch (error) {
//             console.error("⚠️ Error loading SoundFont:", error);
//         }
//     }


export class Player {
    private audioContext: AudioContext;
    private instrument: any | null = null;
    private noteSustainStrength: number = 0;
    private activeNotes: Map<number, AudioBufferSourceNode> = new Map();

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.loadSoundFont("acoustic_grand_piano");
    }

    async loadSoundFont(instrument: InstrumentName) {
        console.log(`Loading ${instrument}...`);
        try {
            this.instrument = await Soundfont.instrument(this.audioContext, instrument, {
                soundfont: CONSTANTS.SOUNDFONT_URL,
            });
            console.log("✅ SoundFont loaded successfully");
        } catch (error) {
            console.error("⚠️ Error loading SoundFont:", error);
        }
    }

    public setSustainStrength(sustainStrength: number) {
        this.noteSustainStrength = sustainStrength;
    }

    async playNoteDown(pitch: number) {
        if (!this.instrument) return;

        const now = this.audioContext.currentTime;
        const noteSource = this.instrument.play(pitch, now, { gain: 1 });

        if (noteSource) {
            this.activeNotes.set(pitch, noteSource);
        }
    }

    async playNoteUp(pitch: number) {
        if (!this.instrument || !this.activeNotes.has(pitch)) return;

        const noteSource = this.activeNotes.get(pitch);
        this.activeNotes.delete(pitch);

        if (noteSource) {
            // Create a gain node for fade-out
            const gainNode = this.audioContext.createGain();
            noteSource.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Apply a linear fade-out
            const fadeTime = 1 * this.noteSustainStrength; // Adjust fade time as needed
            const currentTime = this.audioContext.currentTime;

            gainNode.gain.setValueAtTime(1, currentTime);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeTime); // Smooth linear fade to 0

            // Stop the note slightly after the fade-out
            setTimeout(() => {
                noteSource.stop(); // Safely stop the note
                noteSource.disconnect(); // Clean up resources
                gainNode.disconnect(); // Disconnect gain node
            }, (fadeTime + 0.1) * 1000); // Add a small buffer (100ms) to ensure no cut-off
        }
    }
}


export const player = new Player();
const genie = new mm.PianoGenie(CONSTANTS.GENIE_CHECKPOINT);
await genie.initialize();
console.log("initialized!")

let lastPlayedNote: number | null = null;
export async function buttonDown(button: number, buttonKind: ControllerButtonKind) {
    if (!genie) {
        console.warn("⚠️ Piano Genie is not ready yet.");
        return;
    }

    const TEMPERATURE = 0.25;

    // Add the MIDI values corresponding to the C major scale to the keyWhitelist array
    const cMajorScale = [0, 3, 5, 6, 7, 10]; // MIDI values for C major scale
    const notCMajorScale = [1, 2, 4, 8, 9, 11];

    function getScaleFromInput(buttonKind: ControllerButtonKind) {
        switch (buttonKind) {
            case ControllerButtonKind.A:
                return cMajorScale;
            case ControllerButtonKind.X:
                return notCMajorScale;
            default:
                return cMajorScale;
        }
    }
    let filteredKeyWhitelist = keyWhitelist.filter((note) => getScaleFromInput(buttonKind).includes((note + 9) % 12));

    // Remove the last played note from the filteredKeyWhitelist
    if (lastPlayedNote !== null) {
        filteredKeyWhitelist = filteredKeyWhitelist.filter(note => note !== lastPlayedNote);
    }

    // const note = await genie.next(button)
    const note = await genie.nextFromKeyWhitelist(button, filteredKeyWhitelist, TEMPERATURE);
    lastPlayedNote = note;
    const pitch = CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + note;
    player.playNoteDown(pitch);

    console.log(`🎶 Playing note: ${pitch} (MIDI) from button ${button}`);
}

export async function buttonUp() {
    if (lastPlayedNote === null) return;
    player.playNoteUp(CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + lastPlayedNote);
    console.log("called")
} 
