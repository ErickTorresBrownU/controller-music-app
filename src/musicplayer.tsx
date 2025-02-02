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
    private player = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.loadSoundFont();
    }
    async loadSoundFont() {
        try {
            this.instrument = await Soundfont.instrument(this.audioContext, "ocarina", {
                soundfont: CONSTANTS.SOUNDFONT_URL,
            });
            console.log("✅ SoundFont loaded successfully");
        } catch (error) {
            console.error("⚠️ Error loading SoundFont:", error);
        }
    }

    async playNoteDown(pitch: number) {
        if (this.player) {
            // await mm.Player.tone.context.resume();
            this.instrument.play(pitch, this.audioContext.currentTime, { duration: 1 });
        } else {
            console.warn("⚠️ SoundFont not loaded yet.");
        }
    }

    async playNoteUp(pitch) {
        // Send to MIDI out or play with the Magenta player.
        // if (this.usingMidiOut) {
        //   this.sendMidiNoteOff(pitch, button);
        // } else {
        //   this.player.playNoteUp({pitch:pitch});
        // }
        if (!this.player) return;
        console.log(pitch)
        this.player.playNoteUp({ pitch: pitch });
    }
}

const player = new Player();
const genie = new mm.PianoGenie(CONSTANTS.GENIE_CHECKPOINT);
await genie.initialize();
console.log("initialized!")

let lastPlayedNote: number | null = null;
export async function buttonDown(button: number) {
    if (!genie) {
        console.warn("⚠️ Piano Genie is not ready yet.");
        return;
    }

    const TEMPERATURE = 0.25;

    // Add the MIDI values corresponding to the C major scale to the keyWhitelist array
    const cMajorScale = [0, 2, 3, 4, 7, 9]; // MIDI values for C major scale
    let filteredKeyWhitelist = keyWhitelist.filter((note) => cMajorScale.includes((note + 9) % 12));

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