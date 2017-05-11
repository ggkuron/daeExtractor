
import  MyApp  from './main';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ReduxAction, ReduxState } from './store';

export class ActionDispatcher {
    constructor(private dispatch: (action: ReduxAction) => void) {
    }
}


export default connect(
    (state: ReduxState) => ({value: state.objects}),
    (dispatch: Dispatch<ReduxAction>) => ({action: new ActionDispatcher(dispatch)})
)(MyApp)
