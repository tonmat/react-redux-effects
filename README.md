# React Redux Effects

## Installation

```bash
npm install react-redux-effects
```

```js
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { effectsReducers, effectsMiddleware } from 'react-redux-effects';
import reducers from './reducers';

const rootReducer = combineReducers({ ...reducers, ...effectsReducers }); 
const store = createStore(rootReducer, applyMiddleware(effectsMiddleware));
```

## Example

store/foo.js
```js
import api from '../api';

const initial_state = {
  data: []
}

export const types = {
  fetch: 'foo/fetch',
  fetchOk: 'foo/fetch_ok'
}

export const actions = {
  fetch: () => [{ type: types.fetch }, fetch],
  fetchOk: data => ({ type: types.fetchOk, data })
}

export default function reducer(state = initial_state, action) {
  switch (action.type) {
    case types.fetchOk:
      return { ...state, data: action.data };
  }
  return state;
}

async function fetch(action, store) { 
  const res = await api.get('/foo');
  store.dispatch(actions.fetchOk(res.data)); 
}
```

store/index.js
```js
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { effectsReducers, effectsMiddleware } from 'react-redux-effects';
import foo from './foo';

const rootReducer = combineReducers({ foo, ...effectsReducers }); 
const store = createStore(rootReducer, applyMiddleware(effectsMiddleware)); 
```

index.jsx
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from './store';
import App from './App';

ReactDOM.render(
    (
        <Provider store={store}>
          <App />
        </Provider>
    ),
    document.getElementById('root'));
```

App.jsx
```jsx
import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useErrors, useLoading} from './store/effects';
import {types, actions} from './store/foo';

export default function App() {
  const dispatch = useDispatch();
  const data = useSelector(state => state.foo.data); 
  const loading = useLoading(types.fetch);
  const errors = useErrors(types.fetch);

  const handleClick = e => {
    e.preventDefault();  
    dispatch(types.fetch())
  }
  
  return (
    <div>
        <ul>
          {errors.map((error, i) => <li key={i}>{error.message}</li>)}
        </ul>
        <button onClick={handleClick} disabled={loading}>Fetch!</button>
        <ul>
          {data.map((item, i) => <li key={i}>{item}</li>)}
        </ul>              
    </div>  
  );
}
```
