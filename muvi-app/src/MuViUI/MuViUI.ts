import template from "./MuViUI.html?raw";
import "./MuViUI.css";

export enum UIEvents {
    StartRecording,
    StopRecording,
}

enum UIStates {
    Preview,
    PreRecording,
    Recording,
}

export class MuViUI {
    #events = new Map<UIEvents, () => void>();
    #state = UIStates.PreRecording;

    #onState: Partial<Record<UIStates, () => void>> = {
        [UIStates.Recording]: () => this.#triggerEvent(UIEvents.StartRecording),
    };

    #afterState: Partial<Record<UIStates, () => void>> = {
        [UIStates.Recording]: () => this.#triggerEvent(UIEvents.StopRecording),
    }

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

    #setState(state: UIStates) {
        this.#afterState[this.#state]?.();
        this.#onState[state]?.();
        this.#state = state;
    }

    setEvent(id: UIEvents, event: () => void) {
        this.#events.set(id, event);
    }

    #setupEventTriggers() {
        document.getElementById("record-button")?.addEventListener("click", () => {
            if (this.#state === UIStates.PreRecording) {
                this.#setState(UIStates.Recording);
            } else if (this.#state === UIStates.Recording) {
                this.#setState(UIStates.PreRecording);
            }
        });
        
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
