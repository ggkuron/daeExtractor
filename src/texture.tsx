import * as React from 'react';

import MuiThemeProviderProps = __MaterialUI.Styles.MuiThemeProviderProps;
import muiThemeable from 'material-ui/styles/muiThemeable';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import FloatingActionButton from 'material-ui/FloatingActionButton';

import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentSave from 'material-ui/svg-icons/content/save';
import ContentDel from 'material-ui/svg-icons/action/delete';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';

import {fade} from 'material-ui/utils/colorManipulator'

import { StyleSheet, css } from 'aphrodite';


export interface Props extends MuiThemeProviderProps {
    muiTheme?: __MaterialUI.Styles.MuiTheme;
    items: Item[];
    onNewItemRequest: (item: Item) => void;
    onDeleteRequest: (id: number) => void;
    onUpdateItemRequest: (item: Item) => void;
}
type States = {
    editing: boolean;
    selectedId: number;

    showAddArea: boolean;
    new_id: number;
    new_filename: string;
    error_id: string;
    error_name: string;
};

export interface Item {
    TextureId: number;
    FileName: string;
}


const generateStyles = (muiTheme: __MaterialUI.Styles.MuiTheme) => ({
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
        height: 52,
        width: 'auto',
        padding: 5,
        borderBottom: `1px solid ${muiTheme.palette.borderColor}`,
        backgroundColor: muiTheme.palette.canvasColor,
    },
    itemContainerSelected: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 72,
        width: 'auto',
        padding: 5,
        borderBottom: `1px solid ${muiTheme.palette.borderColor}`,
        backgroundColor: muiTheme.palette.canvasColor,
        boxShadow: `inset 0px 0px 4px ${muiTheme.palette.primary1Color}`,
        cursor: 'default',
    },
    itemContainerNotEditable: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 52,
        width: 'auto',
        padding: 5,
        borderBottom: `1px solid ${muiTheme.palette.borderColor}`,
        backgroundColor: muiTheme.palette.canvasColor,
        cursor: 'default',
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
        borderTop: `1px solid ${muiTheme.palette.borderColor}`,
        borderLeft: `1px solid ${muiTheme.palette.borderColor}`,
        borderRight: `1px solid ${muiTheme.palette.borderColor}`,
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
        backgroundColor: muiTheme.palette.borderColor,
        color: muiTheme.palette.textColor,
        ":hover": {
            backgroundColor: fade(muiTheme.palette.borderColor, 0.6),
            color: muiTheme.palette.textColor,
        }
    },
    saveButton: {
        display: 'flex',
    },
    saveButtonHidden: {
        width: 0,
        height: 0,
    },
    inputHidden: {
        width: 0,
        height: 0,
    }
});

class TextureList extends React.Component<Props, States> {
    constructor() {
        super();
        this.state = {
            editing: false,
            selectedId: null,
            showAddArea: false,
        } as States;
    }

    render() {
        const styles = StyleSheet.create(generateStyles(this.props.muiTheme));
        return (
            <div className={css(styles.container)}>
                <ul className={css(styles.listContainer)}>
                    {this.props.items.map((item, i) => {
                        const selected = this.state.selectedId === item.TextureId;
                        return (
                            <ListItem
                                item={item}
                                key={`list${item.TextureId}`}
                                style={selected ? styles.itemContainerSelected : (this.state.editing ? styles.itemContainerNotEditable : styles.itemContainer)}
                                onSelect={() => {
                                    if (!this.state.editing) {
                                        if (!selected)
                                            this.setState({ selectedId: item.TextureId } as States);
                                        else this.setState({ selectedId: null} as States)
                                    }
                                }}
                                onDeleteClick={() => { this.props.onDeleteRequest(item.TextureId) }}
                                onEditStart={() => {
                                    if (this.state.editing) {
                                        return false;
                                    } else {
                                        this.setState({ selectedId: item.TextureId, editing: true } as States)
                                        return true;
                                    }
                                }}
                                onEditComplete={(updated: Item) => {
                                    this.setState({ editing: false } as States);
                                    this.props.onUpdateItemRequest(updated);
                                }}
                                editable={!this.state.editing || selected}
                            />
                        );
                    })}
                    <li className={css(styles.itemContainer, this.state.showAddArea ? styles.editArea : styles.editAreaHidden)} >
                        <TextField id="txt_id" type="number"
                            floatingLabelText={this.state.showAddArea ? "TextureId" : undefined}
                            style={{ flexBasis: '100%' }}
                            onChange={(ev, txt) => {
                                const [id, message] = this.check_id(txt)
                                this.setState({ new_id: id, error_id: message } as States);
                            }}
                            errorText={this.state.error_id}
                        />
                        <div className={css(styles.itemInnerContainer)} style={{ flexBasis: '100%' }} >
                            <input id="upd_file"
                                type="file"
                                className={css(!this.state.showAddArea && styles.inputHidden)}
                                onChange={(ev) => {
                                    const filename = ev.target.files[0].name;
                                    this.setState({ new_filename: filename } as States);
                                }}
                            />
                        </div>
                        <FloatingActionButton
                            className={css(styles.saveButton, !this.state.showAddArea && styles.saveButtonHidden)}
                            onTouchTap={() => {
                                if (this.state.new_id && this.state.new_filename) {
                                    this.props.onNewItemRequest({
                                        TextureId  : this.state.new_id,
                                        FileName: this.state.new_filename,
                                    });
                                }
                            }}
                            disabled={!!this.state.error_id || !this.state.new_filename}
                        ><ContentSave /></FloatingActionButton>
                    </li>
                    <li className={css(styles.itemContainer, this.state.showAddArea ? styles.editArea : styles.editAreaHidden)} >
                        <FlatButton label="hide" onTouchTap={() => this.setState({ showAddArea: false })} className={css(styles.itemInnerContainer, styles.flatButton, styles.hideButton)} />
                    </li>
                </ul>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <FloatingActionButton
                        onTouchTap={() => {
                            this.setState({ showAddArea: true })
                        }}
                        className={css(styles.addButton, this.state.showAddArea && styles.addButtonHidden)}
                    ><ContentAdd /></FloatingActionButton>
                </div>

            </div>
        );
    }
    private check_id: (txt: string) => [number, string] = (txt: string) => {
        const id = parseInt(txt);
        if (!isNaN(id)) {
            if (this.props.items.every((e) => e.TextureId !== id))
                return [id, null];
            else
                return [null, "重複している"];
        } else return [null, "数字でない"];
    }

}

export interface ListItemProps extends MuiThemeProviderProps {
    item: Item;
    style?: React.CSSProperties;
    editable: boolean;
    onSelect: (item: number) => void;
    onDeleteClick: (id: number) => void;
    onEditStart: () => boolean; // isOk
    onEditComplete: (item: Item) => void;
}
type ListItemStates = {
    editing: boolean;
    new_textureId: number;
    new_name: string;
    error_texture: string;
}

class ListItem extends React.Component<ListItemProps, ListItemStates> {
    constructor(props: ListItemProps) {
        super();
        this.state = {
            editing: false,
            new_name: props.item.FileName,
            new_textureId: props.item.TextureId,
        } as ListItemStates; 
    }

    componentWillReceiveProps(nextProps: ListItemProps) {
        if(this.props.item.TextureId !== nextProps.item.TextureId) 
            this.setState({editing: false, new_name: nextProps.item.FileName, new_textureId: nextProps.item.TextureId})
    }

    render() {
        return (
            <li className={css( this.props.style )}
                onClick={() => this.props.onSelect(this.props.item.TextureId)}
            >
                <div>{this.state.editing ?
                    <TextField floatingLabelText="TextureId" defaultValue={this.props.item.TextureId}
                        type="number"
                        disabled={true}
                    /> :
                    this.props.item.TextureId}</div>
                <div>{this.state.editing ?
                    <TextField floatingLabelText="FileName" defaultValue={this.props.item.FileName}
                        onChange={(ev, txt) => {
                            this.setState({ new_name: txt } as ListItemStates);
                        }}
                    /> :
                    this.props.item.FileName}</div>
                <div style={{
                        visibility: this.props.editable ? 'visible' : 'hidden',
                        opacity: this.props.editable ? 1 : 0,
                    }}>
                    {this.state.editing ?
                        <FloatingActionButton zDepth={0} mini={true}
                            onTouchTap={() => {
                                this.props.onEditComplete({
                                    TextureId: this.props.item.TextureId,
                                    FileName: this.state.new_name,
                                });
                                this.setState({ editing: false });
                            }}
                            disabled={!!this.state.error_texture}
                        ><ContentSave /></FloatingActionButton> :
                        <FloatingActionButton zDepth={0} mini={true} secondary={true}
                            onTouchTap={() => {
                                if (this.props.onEditStart())
                                    this.setState({ editing: true });
                            }}
                        ><ModeEdit /></FloatingActionButton>
                    }
                    {this.state.editing ?
                        <FloatingActionButton zDepth={0} mini={true}
                            style={{ marginLeft: 15 }}
                            onTouchTap={() => { this.props.onDeleteClick(this.props.item.TextureId); }}
                        ><ContentDel /></FloatingActionButton> : null
                    }
                </div>
            </li>
        );
    }
}

export default (
    muiThemeable()((props: Props) => (<TextureList {...props} />))
)