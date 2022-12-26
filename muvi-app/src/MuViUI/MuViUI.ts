import template from "./MuViUI.html?raw";
import "./MuViUI.css";

export enum UIEvents {
    StartRecording,
    StopRecording,
}

export class MuViUI {
    #events = new Map<UIEvents, () => void>();

    #triggerEvent(id: UIEvents) {
        const event = this.#events.get(id);
        if (!event) {
            console.error("Event not set.");
            return;
        }
        event();
    }

    setEvent(id: UIEvents, event: () => void) {
        this.#events.set(id, event);
    }

    #setupEventTriggers() {
        document.getElementById("record")?.addEventListener("click", () =>
            this.#triggerEvent(UIEvents.StartRecording));
        document.getElementById("stop-recording")?.addEventListener("click", () =>
            this.#triggerEvent(UIEvents.StopRecording));
        
    }

    render() {
        const root = document.getElementById("root");

        if (!root) {
            console.error("Could not find application root.");
            return;
        }

        root.innerHTML = template;
        this.#setupEventTriggers();
    }

    setCameraSource(source: MediaStream) {
        const display = document.getElementById("display");

        if (!(display instanceof HTMLVideoElement)) {
            console.error("Could not find display.");
            return;
        }

        display.srcObject = source;
        display.play();
    }

    setPreview(source: Blob) {
        const preview = document.getElementById("preview");

        if (!(preview instanceof HTMLVideoElement)) {
            console.error("Could not find preview element.");
            return;
        }

        preview.src = URL.createObjectURL(source);
    }

    startPreview() {
        const preview = document.getElementById("preview");

        if (!(preview instanceof HTMLVideoElement)) {
            console.error("Could not find preview element.");
            return;
        }

        preview.play();
    }

    getHiddenCanvas() {
        const canvas = document.getElementById("hidden-canvas");

        if (!(canvas instanceof HTMLCanvasElement)) {
            console.error("Could not find the hidden canvas.");
            return null;
        }

        return canvas;
    }
}
