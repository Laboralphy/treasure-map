type AnyListener = EventListenerOrEventListenerObject;

interface HandlerEntry {
    element: EventTarget;
    event: string;
    handler: AnyListener;
}

class DOMEvents {
    private _handlers: HandlerEntry[];

    constructor() {
        this._handlers = [];
    }

    equals(element: EventTarget, event: string, handler: AnyListener): (x: HandlerEntry) => boolean {
        return x => x.element === element && x.event === event && x.handler === handler;
    }

    get(element: EventTarget, event: string, handler: AnyListener): HandlerEntry | undefined {
        return this._handlers.find(x => this.equals(element, event, handler)(x));
    }

    on(element: EventTarget, event: string, handler: AnyListener): void {
        this._handlers.push({ element, event, handler });
        element.addEventListener(event, handler);
    }

    off(element: EventTarget, event: string, handler?: AnyListener): void {
        if (handler) {
            element.removeEventListener(event, handler);
            this._handlers = this._handlers.filter(h => !this.equals(element, event, handler)(h));
        } else {
            this._handlers
                .filter(x => x.element === element && x.event === event)
                .forEach(h => this.off(element, event, h.handler));
        }
    }
}

export default DOMEvents;
