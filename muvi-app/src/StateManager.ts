type StateTransitions<StateType extends string | number> = Partial<Record<StateType, () => void>>;

export class StateManager<StateType extends string | number> {
    #currentState: StateType;
    #onState: StateTransitions<StateType>;
    #afterState: StateTransitions<StateType>;

    constructor(
        initialState: StateType,
        onState: StateTransitions<StateType>,
        afterState: StateTransitions<StateType>,
    ) {
        this.#currentState = initialState;
        this.#onState = onState;
        this.#afterState = afterState;
    }

    setState(state: StateType) {
        if (this.#currentState) {
            this.#afterState[this.#currentState]?.();
        }
        this.#onState[state]?.();
        this.#currentState = state;
    }

    get currentState() {
        return this.#currentState;
    }
}