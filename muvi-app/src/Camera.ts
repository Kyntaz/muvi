import { MuViUI, UIEvents } from "./MuViUI/MuViUI";

export class Camera {
    static #ui = MuViUI;
    static #stream?: MediaStream;
    static #recorder?: MediaRecorder;
    static #data: Blob[] = [];

    private constructor() {}

    static async setup() {
        this.#stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        this.#ui.setCameraSource(this.#stream);
        this.#ui.setEvent(UIEvents.StartRecording, () => this.record());
        this.#ui.setEvent(UIEvents.StopRecording, () => this.stop());
    }

    static record() {
        console.log("Start recording.");
        if (!this.#stream) {
            console.error("Recording before camera has started.");
            return;
        }

        this.#recorder = new MediaRecorder(this.#stream);
        this.#recorder.ondataavailable = (ev) => this.#data.push(ev.data);
        this.#recorder.start();

        this.#recorder.onstop = () => {
            const blob = new Blob(this.#data, { type: "video/webm" });
            this.#ui.setPreview(blob);
            this.#data = [];
        }
    }

    static async stop() {
        console.log("Stop recording.");
        if (!this.#recorder) {
            console.error("Stopping a recording before starting it.");
            return;
        }

        this.#recorder.stop();
    }
}
