import { Camera } from "./Camera";
import { MuViUI, UIEvents } from "./MuViUI/MuViUI";

export class MuVi {
    static #ui = MuViUI;
    static #camera = Camera;

    static async initialize() {
        this.#ui.render();
        this.#ui.setCameraSource(await this.#camera.getStream());
        
        this.#ui.setEvent(UIEvents.StartRecording, () => this.#camera.record());
        this.#ui.setEvent(UIEvents.StopRecording, async () => {
            const blob = await this.#camera.stop();
            if (blob) {
                this.#ui.setPreview(blob);
            }
        });
    }
}

MuVi.initialize();
