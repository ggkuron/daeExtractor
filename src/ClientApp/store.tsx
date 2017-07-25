import { createStore, combineReducers, Action } from 'redux';
import MyApp, { ObjectActions, ObjectState } from './module';


export default createStore(
    combineReducers({
        MyApp
    })
);

export type ReduxState = {
    objects: ObjectState
};

export type ReduxAction = Action