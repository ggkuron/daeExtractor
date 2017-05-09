import * as React from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentDel from 'material-ui/svg-icons/content/clear';

import { StyleSheet, css } from 'aphrodite';


export interface Props extends __MaterialUI.Styles.MuiThemeProviderProps {
    muiTheme?: __MaterialUI.Styles.MuiTheme
}
type States = {
    showAddArea: boolean;
};

const styles = StyleSheet.create({
    container: {
    },
    editArea: {
        height: 'auto',
        transition: 'height 200ms ease-in-out 0ms'
    },
    editAreaHidden: {
        height: 0,
        width: 0,
        transition: 'height 300ms ease-in-out 0ms'
    },
    itemContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 40,
        width: 'auto',
    },
    itemInnerContainer: {
        display: 'flex',
        height: '100%',
        width: '100%',
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    addButton: {
        float: 'right',
        marginTop: 15,
    },
});

class ObjectTable extends React.Component<Props, States> {
    constructor() {
        super();
        this.state = { showAddArea: false };
    }
    render() {
        return (
            <div className={css(styles.container)}>
                <ul className={css(styles.listContainer)}>
                    <li className={css(styles.itemContainer)} >
                            <div>id</div>
                            <div>name</div>
                            <div>
                            <FloatingActionButton zDepth={0} mini={true} secondary={true}><ContentDel /></FloatingActionButton>
                            </div>
                    </li>
                    <li className={css(styles.itemContainer, this.state.showAddArea? styles.editArea: styles.editAreaHidden )} >
                            <TextField id="txt_id" type="number" />
                            <TextField id="txt_name" />
                            <div className={css(styles.itemInnerContainer)}>
                                <input id="upd_file" type="file"></input>
                            </div>
                            <FlatButton label="Save" className={css(styles.itemInnerContainer)} />
                    </li>
                    <li className={css(styles.itemContainer, this.state.showAddArea? styles.editArea: styles.editAreaHidden )} >
                        <FlatButton label="hide" onTouchTap={() => this.setState({ showAddArea: false })} className={css(styles.itemInnerContainer)} />
                    </li>
                </ul>
                <FloatingActionButton onTouchTap={() => this.setState({ showAddArea: true })} className={css(styles.addButton)}><ContentAdd /></FloatingActionButton>
            </div>
        );
    }
}


export default (
    muiThemeable()((props: Props) => (<ObjectTable {...props} />))
)
