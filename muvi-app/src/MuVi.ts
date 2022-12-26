import { Camera } from "./Camera";
import { MuViUI, UIEvents } from "./MuViUI/MuViUI";

export class MuVi {
    ui = new MuViUI();
    camera = new Camera();

    async initialize() {
        this.ui.render();
        this.ui.setCameraSource(await this.camera.getStream());
        
        this.ui.setEvent(UIEvents.StartRecording, () => this.camera.record());
        this.ui.setEvent(UIEvents.StopRecording, async () => {
            const blob = await this.camera.stop();
            if (blob) {
                this.ui.setPreview(blob);
            }
        });
    }
}

(window as any).MuVi = new MuVi();
(window as any).MuVi.initialize();
