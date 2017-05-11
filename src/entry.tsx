import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Container from "./Container";
import { Provider } from 'react-redux';
import store from './store';

ReactDOM.render(
    <Provider store={store}>
        <Container />
    </Provider>
    , document.getElementById('app')
);
