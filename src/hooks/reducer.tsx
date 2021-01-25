interface SetDataAction<T> {
  type: 'SET_DATA'
  data?: T
}

interface SetErrorAction {
  type: 'SET_ERROR'
  error: Error
}

type Action<T> = SetDataAction<T> | SetErrorAction

export interface State<T> {
  isLoading: boolean
  data?: T
  error?: Error
}

const getInitialState = <T extends any>(data?: T): State<T> => ({ error: undefined, isLoading: !data, data });

const createReducer = <T extends any>() => (state: State<T>, action: Action<T>) => {
  switch (action.type) {
    case 'SET_DATA': {
      return {
        ...state,
        error: undefined,
        isLoading: false,
        data: action.data,
      };
    }
    case 'SET_ERROR': {
      return {
        ...state,
        isLoading: false,
        data: undefined,
        error: action.error,
      };
    }
    default:
      return state;
  }
};

export { createReducer, getInitialState };
