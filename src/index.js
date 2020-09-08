import {useSelector} from 'react-redux';

export const effectsReducers = {
  '@@LOADING'(state = {}, action) {
    switch (action.type) {
      case '@@LOADING/BEGIN':
        return {...state, [action.target]: true};
      case '@@LOADING/END':
        return {...state, [action.target]: false};
    }
    return state;
  },
  '@@ERRORS'(state = {}, action) {
    switch (action.type) {
      case '@@ERRORS/CLEAR':
        return {...state, [action.target]: false};
      case '@@ERRORS/SET':
        return {...state, [action.target]: action.error ?? true};
    }
    return state;
  },
};

export function effectsMiddleware(store) {
  return function(next) {
    const activeEffects = {};
    return function(action) {
      if (action instanceof Array) {
        if (activeEffects[action[0].type])
          return;
        activeEffects[action[0].type] = true;
        next(action[0]);
        store.dispatch({type: '@@LOADING/BEGIN', target: action[0].type});
        store.dispatch({type: '@@ERRORS/CLEAR', target: action[0].type});
        return Promise.resolve()
            .then(() => action[1](action[0], store))
            .catch(error => store.dispatch({type: '@@ERRORS/SET', target: action[0].type, error}))
            .finally(() => store.dispatch({type: '@@LOADING/END', target: action[0].type}))
            .finally(() => activeEffects[action[0].type] = false);
      }
      return next(action);
    };
  };
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useLoading() {
  const loading = useSelector(state => state['@@LOADING']);
  if (arguments.length === 0)
    return Object.values(loading).some(value => !!value);
  for (const arg of arguments)
    if (loading[arg])
      return true;
  return false;
}

export function useErrors() {
  const error = useSelector(state => state['@@ERRORS']);
  if (arguments.length === 0)
    return Object.values(error).flatMap(value => value ?? []);
  return Array.from(arguments).flatMap(arg => error[arg] ?? []);
}
