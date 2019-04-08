class Automaton {

    constructor() {
        this._state = '';
        this._transitions = {};
        this._instance = null;
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
    }

    get instance() {
        return this._instance;
    }

    set instance(value) {
        this._instance = value;
    }

    _invokeTransition(test, state) {
        if (test in this._instance) {
            if (this._instance[test]()) {
                this._state = state;
                return true;
            }
        } else {
            throw new Error('this transition does not exists : "' + test + '"');
        }
        return false;
    }

    _invokeState(s) {
        if (s in this._instance) {
            this._instance[s]();
        }
    }

    process() {
        const s = this._state;
        this._invokeState(s);
        // compute transition
        if (s in this._transitions) {
            const transitions = this._transitions[s];
            for (let t in transitions) {
                if (transitions.hasOwnProperty(t) && this._invokeTransition(t, transitions[t])) {
                    break;
                }
            }
        }
    }

}

export default Automaton;
