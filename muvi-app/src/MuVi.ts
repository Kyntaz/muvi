import { Camera } from "./Camera";
import { MuViUI, UIEvents } from "./MuViUI/MuViUI";
import { VideoManager } from "./VideoManager";

export class MuVi {
    ui = new MuViUI();
    camera = new Camera();
    videoManager = new VideoManager();

    async renderPreview() {
        this.ui.doWith(HTMLCanvasElement, "hidden-canvas", async (canvas) => {
            const preview = await this.videoManager.renderMaster(canvas);
            this.ui.setPreview(preview);
        });
    }

    async initialize() {
        this.ui.render();

        const cameraStream = await this.camera.getStream();
        this.ui.setCameraSource(cameraStream);

        const cameraSettings = cameraStream.getVideoTracks()[0].getSettings();
        this.videoManager.setDimensions(cameraSettings.width ?? 200, cameraSettings.height ?? 200);

        this.ui.setEvent(UIEvents.StartRecording, () => {
            this.camera.record();
            this.ui.startPreview();
        });
        this.ui.setEvent(UIEvents.StopRecording, async () => {
            const blob = await this.camera.stop();
            if (blob) {
                this.videoManager.addVideo(blob);
                await this.renderPreview();
            }
        });
    }
}

(window as any).MuVi = new MuVi();
(window as any).MuVi.initialize();
