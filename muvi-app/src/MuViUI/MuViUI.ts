import template from "./MuViUI.html?raw";
import "./MuViUI.css";

export enum UIEvents {
    StartRecording,
    StopRecording,
}

export class MuViUI {
    #events = new Map<UIEvents, () => void>();

    doWith<ElementType extends typeof HTMLElement>(
        cls: ElementType,
        id: string,
        action: (el: InstanceType<ElementType>) => void
    ) {
        const element = document.getElementById(id);

        if (!(element instanceof cls)) {
            console.error(`Could not find ${id} element in the UI.`);
            return;
        }

        action(element as InstanceType<ElementType>);
    }

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
        this.doWith(HTMLElement, "root", (root) => {
            root.innerHTML = template;
            this.#setupEventTriggers();
        });
    }

    setCameraSource(source: MediaStream) {
        this.doWith(HTMLVideoElement, "display", (display) => {
            display.srcObject = source;
            display.play();
        });
    }

    setPreview(source: Blob) {
        this.doWith(HTMLVideoElement, "preview", (preview) => {
            preview.src = URL.createObjectURL(source);
        });
    }

    startPreview() {
        this.doWith(HTMLVideoElement, "preview", (preview) => {
            preview.play();
        });
    }
}
