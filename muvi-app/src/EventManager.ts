export class EventManager<EventId extends number | string> {
    #events = new Map<EventId, () => void>();

    setEvent(id: EventId, event: () => void) {
        this.#events.set(id, event);
    }

    triggerEvent(id: EventId) {
        const event = this.#events.get(id);
        if (!event) {
            console.error("Event not set.");
            return;
        }
        event();
    }
}