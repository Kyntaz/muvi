import etro from "etro";

export class VideoManager {
    readonly #canvas: HTMLCanvasElement = document.createElement("canvas");
    #videos: Blob[] = [];
    #width = 200;
    #height = 200;

    setDimensions(width: number, height: number) {
        this.#width = width;
        this.#height = height;
    }

    addVideo(blob: Blob) {
        this.#videos.push(blob);
    }

    async #getSourceDuration(source: HTMLVideoElement) {
        return new Promise<number>((resolve) => {
            source.onloadedmetadata = () => {
                source.currentTime = Number.MAX_SAFE_INTEGER;
                source.ontimeupdate = () => {
                    source.ontimeupdate = () => {};
                    source.currentTime = 0.1;
                    source.currentTime = 0;
                    resolve(source.duration);
                }
            }
        });
    }

    async renderMaster() {
        const movie = new etro.Movie({ canvas: this.#canvas });
        movie.width = this.#width;
        movie.height = this.#height;

        let maxDuration = 0;
        for (const video of this.#videos) {
            const source = document.createElement("video");
            source.src = URL.createObjectURL(video);

            const duration = await this.#getSourceDuration(source);
            maxDuration = Math.max(maxDuration, duration);

            const layer = new etro.layer.Video({ startTime: 0, source });
            movie.addLayer(layer);
        }
        
        return movie.record({
            frameRate: 30,
            duration: maxDuration,
        });
    }
}