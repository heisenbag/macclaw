/**
 * KokoroSpeaker — On-device TTS using kokoro-js (82M ONNX model).
 * Lazily loads the model on first use, then plays audio via macOS `afplay`.
 * All speak() calls are serialized so voices never overlap.
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

const WAV_PATH = join(tmpdir(), 'macclaw_tts.wav');
// Default voice — warm, natural American female.
// Run `tts.list_voices()` for alternatives.
const DEFAULT_VOICE = 'af_heart';

export class KokoroSpeaker {
    private static instance: KokoroSpeaker;
    private tts: any = null;
    private loadPromise: Promise<void> | null = null;
    private speakQueue: Promise<void> = Promise.resolve();
    public enabled: boolean = true;

    static getInstance(): KokoroSpeaker {
        if (!KokoroSpeaker.instance) {
            KokoroSpeaker.instance = new KokoroSpeaker();
        }
        return KokoroSpeaker.instance;
    }

    private async asyncExists(p: string): Promise<boolean> {
        const fs = await import('fs/promises');
        try {
            await fs.access(p);
            return true;
        } catch {
            return false;
        }
    }

    private async load(): Promise<void> {
        if (this.tts) return;
        if (this.loadPromise) return this.loadPromise;

        this.loadPromise = (async () => {
            const { KokoroTTS } = await import('kokoro-js');
            const path = await import('path');

            // Try to find bundled models relative to the bundle location
            // Dist: node_modules/macclaw/dist/cli/index.js -> ../../models
            // Dev: src/cli/tts.ts -> ../../models
            const localModelPath = path.resolve(__dirname, '../../models');
            const hasLocalModels = await this.asyncExists(localModelPath);

            if (hasLocalModels) {
                console.log('\n\x1b[35m[TTS] Loading bundled Kokoro model...\x1b[0m\n');
                this.tts = await KokoroTTS.from_pretrained(localModelPath, {
                    dtype: 'q8',
                    device: 'cpu',
                });
            } else {
                console.log('\n\x1b[35m[TTS] Bundled model not found. Downloading (~300MB)...\x1b[0m\n');
                this.tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
                    dtype: 'q8',
                    device: 'cpu',
                });
            }
            console.log('\x1b[35m[TTS] Ready.\x1b[0m');
        })();

        return this.loadPromise;
    }

    /**
     * Speak text aloud. Calls are serialized internally — no overlapping audio.
     * Returns immediately (non-blocking from the caller's perspective).
     */
    speak(text: string): void {
        if (!this.enabled || !text.trim()) return;

        // Chain onto the queue — each speak waits for the previous one to finish
        this.speakQueue = this.speakQueue
            .then(() => this._synthesizeAndPlay(text))
            .catch(() => { /* never let a TTS failure crash the agent */ });
    }

    private async _synthesizeAndPlay(text: string): Promise<void> {
        try {
            await this.load();

            // Clean up markdown/special formatting that sounds bad when spoken
            const clean = text
                .replace(/```[\s\S]*?```/g, '') // strip code blocks
                .replace(/`[^`]+`/g, '')          // strip inline code
                .replace(/\*+|#+|_+/g, '')        // strip markdown symbols
                .replace(/https?:\/\/\S+/g, '')   // strip URLs
                .trim();

            if (!clean) return;

            const audio = await this.tts.generate(clean, { voice: DEFAULT_VOICE });

            // kokoro-js audio object: convert to WAV and play via afplay (macOS built-in)
            const audioData = audio.toWav();
            await writeFile(WAV_PATH, Buffer.from(audioData));
            await execAsync(`afplay ${WAV_PATH}`);
        } catch {
            // Silently swallow TTS errors — never interrupt the main agent loop
        }
    }

    dispose(): void {
        this.tts = null;
        this.loadPromise = null;
    }
}
