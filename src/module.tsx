
import {Action } from 'redux';

const FETCH_NAME = 'object/fetch';
type FETCH_TYPE = typeof FETCH_NAME;


interface FetchAction extends Action {
    type: FETCH_TYPE;
}
export const fetchAction = (): FetchAction => ({
    type: FETCH_NAME,
})

export interface ObjectState {

}

export type ObjectActions = FetchAction;

const initialState: ObjectState = {};

export default function reducer(state: ObjectState = initialState, action: ObjectActions): ObjectState {
    switch (action.type) {
        case FETCH_NAME:
            return {};
        default:
            return state;
    }
}