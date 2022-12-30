import template from "./MuViUI.html?raw";
import "./MuViUI.css";
import { StateManager } from "../StateManager";
import { EventManager } from "../EventManager";

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
    #onState: Partial<Record<UIStates, () => void>> = {
        [UIStates.Recording]: () => this.#eventManager.triggerEvent(UIEvents.StartRecording),
    };

    #afterState: Partial<Record<UIStates, () => void>> = {
        [UIStates.Recording]: () => this.#eventManager.triggerEvent(UIEvents.StopRecording),
    }

    #eventManager = new EventManager<UIEvents>();
    #stateManager = new StateManager<UIStates>(
        UIStates.PreRecording,
        this.#onState,
        this.#afterState
    );

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

    setEvent(id: UIEvents, event: () => void) {
        this.#eventManager.setEvent(id, event);
    }

    #setupEventTriggers() {
        document.getElementById("record-button")?.addEventListener("click", () => {
            if (this.#stateManager.currentState === UIStates.PreRecording) {
                this.#stateManager.setState(UIStates.Recording);
            } else if (this.#stateManager.currentState === UIStates.Recording) {
                this.#stateManager.setState(UIStates.PreRecording);
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
