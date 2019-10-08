class FSM {
    /**
     * Creates new FSM instance.
     * @param config
     */
    constructor(config = null) {
        if (config == null) {
            throw new Error('Error');
        }
        this.config = config;
        this.init = config.initial;
        this.activestate = config.initial;
        this.statuses = this.getStatuses();
        this.previous = null;
        this.changedStatuses = [];
        this.countofstatuse = 0;

        this.mapper = {
            get_tired: () => this.changeState('sleeping'),
            get_hungry: () => this.changeState('hungry'),
            study: () => this.changeState('busy'),
            eat: () => this.changeState('normal'),
            study: () => this.changeState('busy'),
            get_up: () => this.changeState('normal'),
        }
        this.states = {
            busy: ["get_hungry", "get_tired"],
            normal: ["study"],
            sleeping: ["get_up", "get_hungry"],
            hungry: ["eat"]
        }
        this.allstatuses = ['normal', 'busy', 'hungry', 'sleeping'];;
        this.statesofevent = {
            get_tired: ["busy"],
            get_hungry: ["busy", "sleeping"],
            study: ["normal"],
            get_up: ["sleeping"],
            eat: ["hungry"],
        }
        this.allowstatuschangetoback = {
            busy: ["normal"],
            normal: ["sleeping", "hungry"],
            hungry: ["busy", "sleeping", "normal"],
            sleeping: ["busy", "normal"]

        }
    }

    getStatuses() {
        let firstlevel = Object.keys(this.config.states);

        var firsllevelnames = firstlevel.map(x => {
            let temp = Object.keys(this.config.states[x].transitions);
            return temp.map(y => this.config.states[x].transitions[y]);
        }
        );
        let statuses = firsllevelnames.reduce((y, cur) => y.concat(cur), []);
        let temp3 = new Set(statuses);
        return Array.from(temp3);
    };


    /**
     * Returns active state.
     * @returns {String}
     */
    getState() {
        return this.activestate;
    }

    /**
     * Goes to specified state.
     * @param state
     */
    changeState(state) {
        if (!this.statuses.some(x => x == state)) {
            throw new Error('Error');
        }

        this.previous = this.activestate;
        this.activestate = state;
        return this.activestate;
    }

    /**
     * Changes state according to event transition rules.
     * @param event
     */
    trigger(event) {

        if (this.activestate == 'Error') {
            throw new Error('Error');
        }
        if (!Object.keys(this.states).some(x => x == this.getState())) {
            this.activestate = 'Error';
            throw new Error('Error');
        }
        if (!Object.keys(this.mapper).some(x => x == event)) {
            throw new Error('Error');
        }
        this.mapper[event]();
    }

    /**
     * Resets FSM state to initial.
     */
    reset() {
        return this.activestate = "normal";
    }

    /**
     * Returns an array of states for which there are specified event transition rules.
     * Returns all states if argument is undefined.
     * @param event
     * @returns {Array}
     */
    getStates(event = null) {
        if (event == null) {

            // return this.statuses;
            return this.allstatuses;
        }
        if (!Object.keys(this.statesofevent).some(x => x == event)) {
            return [];
        }
        return this.statesofevent[event];
    }

    /**
     * Goes back to previous state.
     * Returns false if undo is not available.
     * @returns {Boolean}
     */
    undo() {

        let temp = this.allowstatuschangetoback[this.activestate].some(x => x == this.previous);
        if (temp) {
            this.changedStatuses.push(this.activestate);
            this.activestate = this.previous;
            this.countofstatuse = ++this.countofstatuse;
            return true;
        }

        return false;



    }

    /**
     * Goes redo to state.
     * Returns false if redo is not available.
     * @returns {Boolean}
     */
    redo() {
        if (this.previous == null) {
            return false;
        }
        let count = this.changedStatuses.length - this.countofstatuse;
        if (count < 0) {

            return false;
        }
        let temp = this.changedStatuses[count];
        this.countofstatuse = --this.countofstatuse;
        this.changeState(temp);
        return true;

    }

    /**
     * Clears transition history
     */
    clearHistory() {
        this.previous = null;
        this.changedStatuses = [];

    }
}

const config = {
    initial: 'normal',
    states: {
        normal: {
            transitions: {
                study: 'busy',
            }
        },
        busy: {
            transitions: {
                get_tired: 'sleeping',
                get_hungry: 'hungry',
            }
        },
        hungry: {
            transitions: {
                eat: 'normal'
            },
        },
        sleeping: {
            transitions: {
                get_hungry: 'hungry',
                get_up: 'normal',
            },
        },
    }
};

module.exports = FSM;

/** @Created by Uladzimir Halushka **/
