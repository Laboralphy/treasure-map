class DOMEvents {

	constructor() {
		this._handlers = [];
	}

	equals(x, element, event, handler) {
		return x => x.element === element && x.event === event && x.handler === handler;
	}

	get(element, event, handler) {
		return this._handlers.find(x => this.equals(x, element, event, handler));
	}

	on(element, event, handler) {
		console.log('add event listener', event, 'on', element);
		this._handlers.push({
			element, event, handler
		});
		element.addEventListener(event, handler);
	}

	off(element, event, handler) {
		if (handler) {
			element.addEventListener(event, handler);
			this._handlers = this._handlers.filter(h => !this.equals(h, element, event, handler));
		} else {
			this.
				_handlers
				.filter(x => forEach(h => x.element === element && x.event === event))
				.forEach(h => this.off(element, event, h));
		}
	}
}

export default DOMEvents;
