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
    ObjectId: number;
    items: ItemSummary[];
    onDeleteRequest: (id: number) => void;
    onUpdateItemRequest: (item: Item) => void;
}
type States = {
    editing: boolean;
    selectedId: number;
};


export interface Item {
    ObjectId: number;
    MeshId: number;
    TextureId: number;
    Name: string;
}
export interface ItemSummary extends Item {
    VertexCount?: number;
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
        width: 110,
    },
});

class MeshTable extends React.Component<Props, States> {
    constructor() {
        super();
        this.state = {
            editing: false,
            selectedId: null,
        } as States;
    }
    componentWillReceiveProps(nextProps: Props) {
        if (this.props.ObjectId !== nextProps.ObjectId)
            this.setState({ editing: false, selectedId: null})
    }
    render() {
        const styles = StyleSheet.create(generateStyles(this.props.muiTheme));
        return (
            <div className={css(styles.container)}>
                <ul className={css(styles.listContainer)}>
                    {this.props.items.map((item, i) => {
                        const selected = this.state.selectedId === item.MeshId;
                        return (
                            <ListItem
                                item={item}
                                key={`list${item.MeshId}`}
                                style={selected ? styles.itemContainerSelected : (this.state.editing ? styles.itemContainerNotEditable : styles.itemContainer)}
                                onSelect={() => {
                                    if (!this.state.editing) {
                                        if (!selected)
                                            this.setState({ selectedId: item.MeshId } as States);
                                        else this.setState({ selectedId: null} as States)
                                    }
                                }}
                                onDeleteClick={() => { this.props.onDeleteRequest(item.MeshId) }}
                                onEditStart={() => {
                                    if (this.state.editing) {
                                        return false;
                                    } else {
                                        this.setState({ selectedId: item.MeshId, editing: true } as States)
                                        return true;
                                    }
                                }}
                                onEditComplete={(updated: Item) => {
                                    this.setState({ editing: false } as States);
                                    this.props.onUpdateItemRequest(updated);
                                }}
                                editable={!this.state.editing || selected}
                                check_MeshId={this.check_MeshId}
                                check_TextureId={this.check_TextureId}
                            />
                        );
                    })}
                </ul>

            </div>
        );
    }
    private check_MeshId: (txt: string) => [number, string] = (txt: string) => {
        const id = parseInt(txt);
        if (!isNaN(id)) {
            if (this.props.items.every((e) => e.MeshId !== id))
                return [id, null];
            else
                return [null, "重複している"];
        } else return [null, "数字でない"];
    }
    private check_TextureId: (txt: string) => [number, string] = (txt: string) => {
        const id = parseInt(txt);
        if (!isNaN(id)) {
            return [id, null]; // TODO
        } else return [null, "数字でない"];
    }
}

export interface ListItemProps extends MuiThemeProviderProps {
    item: ItemSummary;
    style?: React.CSSProperties;
    editable: boolean;
    onSelect: (item: number) => void;
    onDeleteClick: (id: number) => void;
    onEditStart: () => boolean; // isOk
    onEditComplete: (item: Item) => void;
    check_MeshId: (txt: string) => [number, string];
    check_TextureId: (txt: string) => [number, string];
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
            new_name: props.item.Name,
            new_textureId: props.item.TextureId,
        } as ListItemStates; 
    }

    componentWillReceiveProps(nextProps: ListItemProps) {
        if(this.props.item.ObjectId !== nextProps.item.ObjectId) 
            this.setState({editing: false, new_name: nextProps.item.Name, new_textureId: nextProps.item.TextureId})
    }

    render() {
        return (
            <li className={css( this.props.style )}
                onClick={() => this.props.onSelect(this.props.item.MeshId)}
            >
                <div>{this.state.editing ?
                    <TextField floatingLabelText="MeshId" defaultValue={this.props.item.MeshId}
                        type="number"
                        disabled={true}
                    /> :
                    this.props.item.MeshId}</div>
                <div>{this.state.editing ?
                    <TextField floatingLabelText="Name" defaultValue={this.props.item.Name}
                        onChange={(ev, txt) => {
                            this.setState({ new_name: txt } as ListItemStates);
                        }}
                    /> :
                    this.props.item.Name}</div>
                <div>{this.state.editing ?
                    <TextField floatingLabelText="TextureId" defaultValue={this.props.item.TextureId}
                        type="number"
                        onChange={(ev, txt) => {
                            const [new_id, error] = this.props.check_TextureId(txt);
                            this.setState({ new_textureId: new_id, error_texture: error } as ListItemStates);
                        }}
                        errorText={this.state.error_texture}
                    /> :
                    this.props.item.TextureId}</div>
                <div>{this.props.item.VertexCount}</div>
                <div style={{
                        visibility: this.props.editable ? 'visible' : 'hidden',
                        opacity: this.props.editable ? 1 : 0,
                    }}>
                    {this.state.editing ?
                        <FloatingActionButton zDepth={0} mini={true}
                            onTouchTap={() => {
                                this.props.onEditComplete({
                                    ObjectId: this.props.item.ObjectId,
                                    MeshId: this.props.item.MeshId,
                                    Name: this.state.new_name,
                                    TextureId: this.state.new_textureId,
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
                            onTouchTap={() => { this.props.onDeleteClick(this.props.item.MeshId); }}
                        ><ContentDel /></FloatingActionButton> : null
                    }
                </div>
            </li>
        );
    }
}

export default (
    muiThemeable()((props: Props) => (<MeshTable {...props} />))
)