const Automaton = require('../src/automaton').default;



class MyAuto {
    constructor() {
        this.goal = 0;
        this.guess = 0;
        this.log = [];
        this.tries = 0;
        this.chart = {
            'guessing': {
                'isTooSmall': 'wasTooSmall',
                'isTooLarge': 'wasTooLarge',
                'isEqual': 'wasEqual'
            },

            'wasTooSmall': {
                'isTooSmall': 'wasTooSmall',
                'isTooLarge': 'wasTooLarge',
                'isEqual': 'wasEqual'
            },

            'wasTooLarge': {
                'isTooSmall': 'wasTooSmall',
                'isTooLarge': 'wasTooLarge',
                'isEqual': 'wasEqual'
            },

            'wasEqual': {
            }
        }
    }

    // tests
    isTooSmall() {
        return this.guess < this.goal;
    }

    isTooLarge() {
        return this.guess > this.goal;
    }

    isEqual() {
        return this.guess === this.goal;
    }


    // states
    guessing() {
        this.log.push('guessing');
    }

    wasTooSmall() {
        ++this.tries;
        this.log.push('wasTooSmall');
    }

    wasTooLarge() {
        ++this.tries;
        this.log.push('wasTooLarge');
    }

    wasEqual() {
        ++this.tries;
        this.log.push('wasEqual after ' + this.tries + ' tries');
    }
}



describe('automation', function() {
    describe('test1', function() {
        it ('should be too small', function() {
            const oInstance = new MyAuto();
            oInstance.goal = 76;
            oInstance.guess = 50;

            const auto = new Automaton();
            auto.instance = oInstance;
            auto.transitions = oInstance.chart;
            auto.state = 'guessing';

            auto.process();
            expect(auto.state).toBe('wasTooSmall');
        });

        it ('should be too large', function() {
            const oInstance = new MyAuto();
            oInstance.goal = 76;
            oInstance.guess = 50;

            const auto = new Automaton();
            auto.instance = oInstance;
            auto.transitions = oInstance.chart;
            auto.state = 'guessing';

            auto.process();
            expect(auto.state).toBe('wasTooSmall');
            oInstance.guess = 80;
            auto.process();
            expect(auto.state).toBe('wasTooLarge');
        });

        it ('should be too good after several tries', function() {
            const oInstance = new MyAuto();
            oInstance.goal = 76;
            oInstance.guess = 50;

            const auto = new Automaton();
            auto.instance = oInstance;
            auto.transitions = oInstance.chart;
            auto.state = 'guessing';

            auto.process();
            oInstance.guess = 80;
            auto.process();
            oInstance.guess = 76;
            auto.process();
            expect(auto.state).toBe('wasEqual');
            expect(oInstance.tries).toBe(2);
        });
    });
});