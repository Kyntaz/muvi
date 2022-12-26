export class Camera {
    static #stream?: MediaStream;
    static #recorder?: MediaRecorder;
    static #data: Blob[] = [];

    private constructor() {}

    static async getStream() {
        if (!this.#stream) {
            this.#stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
        }

        return this.#stream;
    }

    static async record() {
        console.log("Start recording.");
        const stream = await this.getStream();

        this.#recorder = new MediaRecorder(stream);
        this.#recorder.ondataavailable = (ev) => this.#data.push(ev.data);
        this.#recorder.start();
    }

    static async stop() {
        console.log("Stop recording.");
        return new Promise<Blob | null>((resolve) => {
            if (!this.#recorder) {
                console.error("Stopping a recording before starting it.");
                return resolve(null);
            }
    
            this.#recorder.onstop = () => {
                const blob = new Blob(this.#data, { type: "video/webm" });
                this.#data = [];
                resolve(blob);
            }
            this.#recorder.stop();
        });
    }
}
