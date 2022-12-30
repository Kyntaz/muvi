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
        [UIStates.Recording]: () => {
            this.setVisibility("record-view", true);
            this.#eventManager.triggerEvent(UIEvents.StartRecording);
            this.doWith(HTMLElement, "record-button", (button) => {
                button.classList.add("record-button-on");
            });
        },
        [UIStates.Preview]: () => {
            this.setVisibility("preview-view", true);
        },
        [UIStates.PreRecording]: () => {
            this.setVisibility("record-view", true);
        },
    };

    #afterState: Partial<Record<UIStates, () => void>> = {
        [UIStates.Recording]: () => {
            this.setVisibility("record-view", false);
            this.#eventManager.triggerEvent(UIEvents.StopRecording);
            this.doWith(HTMLElement, "record-button", (button) => {
                button.classList.remove("record-button-on");
            });
        },
        [UIStates.Preview]: () => {
            this.setVisibility("preview-view", false);
            this.stopPreview();
        },
        [UIStates.PreRecording]: () => {
            this.setVisibility("record-view", false);
        },
    }

    #eventManager = new EventManager<UIEvents>();
    #stateManager = new StateManager<UIStates>(
        UIStates.PreRecording,
        this.#onState,
        this.#afterState,
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

    setVisibility(id: string, visible: boolean) {
        this.doWith(HTMLElement, id, (element) => {
            if (visible) {
                element.classList.remove("hidden");
            } else {
                element.classList.add("hidden");
            }
        });
    }

    setEvent(id: UIEvents, event: () => void) {
        this.#eventManager.setEvent(id, event);
    }

    #setupEventListeners() {
        document.getElementById("record-button")?.addEventListener("click", () => {
            if (this.#stateManager.currentState === UIStates.PreRecording) {
                this.#stateManager.setState(UIStates.Recording);
            } else if (this.#stateManager.currentState === UIStates.Recording) {
                this.#stateManager.setState(UIStates.Preview);
            }
        });

        document.getElementById("exit-preview")?.addEventListener("click", () => {
            this.#stateManager.setState(UIStates.PreRecording);
        });
    }

    render() {
        this.doWith(HTMLElement, "root", (root) => {
            root.innerHTML = template;
            this.#setupEventListeners();
        });
    }

    setCameraSource(source: MediaStream) {
        this.doWith(HTMLVideoElement, "record-display", (display) => {
            display.srcObject = source;
            display.play();
        });
    }

    setPreview(source: Blob) {
        this.doWith(HTMLVideoElement, "preview-display", (preview) => {
            preview.src = URL.createObjectURL(source);
        });
    }

    startPreview() {
        this.doWith(HTMLVideoElement, "preview-display", (preview) => {
            preview.play();
        });
    }

    stopPreview() {
        this.doWith(HTMLVideoElement, "preview-display", (preview) => {
            preview.pause();
            preview.currentTime = 0;
        });
    }
}
