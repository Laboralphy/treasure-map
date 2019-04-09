class Automaton {

    constructor() {
        this._state = '';
        this._transitions = {};
        this._instance = null;
        this._verbose = false;
    }

    get verbose() {
        return this._verbose;
    }

    set verbose(value) {
        this._verbose = value;
    }

    get state() {
        return this._state;
    }

    set state(value) {
        this._state = value;
    }

    get transitions() {
        return this._transitions;
    }

    set transitions(value) {
        this._transitions = value;
        this._state = Object.keys(value).shift();
        this.log('starting at state', this._state);
    }

    get instance() {
        return this._instance;
    }

    set instance(value) {
        this._instance = value;
    }

    log(...s) {
        if (this._verbose) {
            console.info('[auto]', ...s);
        }
    }

    _invokeTransition(test, state, ...args) {
        if (test in this._instance) {
            if (this._instance[test](...args)) {
                this._state = state;
                this.log('transition', test, 'passed : go to state', state);
                return true;
            }
        } else {
            throw new Error('this transition does not exists : "' + test + '"');
        }
        return false;
    }

    _invokeState(s, ...args) {
        if (s in this._instance) {
            this._instance[s](...args);
        }
    }

    process(...args) {
        const s = this._state;
        this._invokeState(s, ...args);
        // compute transition
        if (s in this._transitions) {
            const transitions = this._transitions[s];
            for (let t in transitions) {
                if (transitions.hasOwnProperty(t) && this._invokeTransition(t, transitions[t], ...args)) {
                    break;
                }
            }
        }
    }

}

export default Automaton;
