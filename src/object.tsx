import * as React from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentDel from 'material-ui/svg-icons/content/clear';

import {fade} from 'material-ui/utils/colorManipulator'

import { StyleSheet, css } from 'aphrodite';


export interface Props extends __MaterialUI.Styles.MuiThemeProviderProps {
    muiTheme?: __MaterialUI.Styles.MuiTheme;
    items: Item[];
}
type States = {
    showAddArea: boolean;
};

export interface Item {
    name: string;
    id: number;
    filename: string;
}

class ObjectTable extends React.Component<Props, States> {
    constructor() {
        super();
        this.state = {
            showAddArea: false
        };
    }
    render() {
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
                padding: 0,
                border: 0,
                transition: 'height 300ms ease-in-out 0ms'
            },
            itemContainer: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 40,
                width: 'auto',
                padding: 5,
                borderBottom: `1px solid ${this.props.muiTheme.palette.borderColor}`,
            },
            itemInnerContainer: {
                display: 'flex',
                height: '100%',
                width: '100%',
            },
            listContainer: {
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                borderTop: `1px solid ${this.props.muiTheme.palette.borderColor}`,
                borderLeft: `1px solid ${this.props.muiTheme.palette.borderColor}`,
                borderRight: `1px solid ${this.props.muiTheme.palette.borderColor}`,
            },
            addButton: {
                float: 'right',
                marginTop: 15,
                opacity: 1,
                transition: 'opacity 300ms ease-in-out 0ms'
            },
            addButtonHidden: {
                opacity: 0,
            },
            flatButton: {
                justifyContent: 'center',
            },
            hideButton: {
                backgroundColor: this.props.muiTheme.palette.borderColor,
                color: this.props.muiTheme.palette.textColor,
                ":hover": {
                    backgroundColor: fade(this.props.muiTheme.palette.borderColor, 0.6),
                    color: this.props.muiTheme.palette.textColor,
                }
            },
            saveButton: {
                width: 110,
            },
            inputHidden: {
                width: 0,
                height: 0,
            }
        });
        return (
            <div className={css(styles.container)}>
                <ul className={css(styles.listContainer)}>
                    {this.props.items.map(item => (
                        <li className={css(styles.itemContainer)} >
                            <div>{item.id}</div>
                            <div>{item.name}</div>
                            <div>{item.filename}</div>
                            <div>
                                <FloatingActionButton zDepth={0} mini={true} secondary={true}><ContentDel /></FloatingActionButton>
                            </div>
                        </li>
                    ))}

                    <li className={css(styles.itemContainer, this.state.showAddArea ? styles.editArea : styles.editAreaHidden)} >
                        <TextField id="txt_id" type="number" floatingLabelText={this.state.showAddArea ? "id" : undefined} style={{ flexBasis: '100%' }} />
                        <TextField id="txt_name" floatingLabelText={this.state.showAddArea ? "name" : undefined} style={{ flexBasis: '100%' }} />
                        <div className={css(styles.itemInnerContainer)} style={{ flexBasis: '100%' }} >
                            <input id="upd_file" type="file" className={css(!this.state.showAddArea && styles.inputHidden)} />
                        </div>
                        <FlatButton label="Save" className={css(styles.itemInnerContainer, styles.flatButton, styles.saveButton)} />
                    </li>
                    <li className={css(styles.itemContainer, this.state.showAddArea ? styles.editArea : styles.editAreaHidden)} >
                        <FlatButton label="hide" onTouchTap={() => this.setState({ showAddArea: false })} className={css(styles.itemInnerContainer, styles.flatButton, styles.hideButton)} />
                    </li>
                </ul>
                <FloatingActionButton onTouchTap={() => this.setState({ showAddArea: true })} className={css(styles.addButton, this.state.showAddArea && styles.addButtonHidden)}><ContentAdd /></FloatingActionButton>
            </div>
        );
    }
}


export default (
    muiThemeable()((props: Props) => (<ObjectTable {...props} />))
)
