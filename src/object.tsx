import * as React from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentSave from 'material-ui/svg-icons/content/save';
import ContentDel from 'material-ui/svg-icons/action/delete';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';

import {fade} from 'material-ui/utils/colorManipulator'
import MuiThemeProviderProps = __MaterialUI.Styles.MuiThemeProviderProps;

import { StyleSheet, css } from 'aphrodite';
import MeshList, { ItemSummary as MeshItemSummary, Item as MeshItem } from './mesh';


export interface Props extends MuiThemeProviderProps {
    muiTheme?: __MaterialUI.Styles.MuiTheme;
    items: Item[];
    onNewItemRequest: (item: Item) => void;
    onDeleteRequest: (id: number) => void;
    onItemFetchRequest: (id: number, action: ((items: MeshItemSummary[]) => void)) => void;
    onUpdateItemRequest: (item: Item) => void;
    onUpdateMeshRequest: (item: MeshItem, completed: ((updated: MeshItem) => void)) => void;
}
type States = {
    showAddArea: boolean;
    new_id: number;
    new_name: string;
    new_filename: string;
    error_id: string;
    error_name: string;

    meshItems: MeshItemSummary[];
    selectedId: number;
    editing: boolean;
};

export interface Item {
    Name: string;
    ObjectId: number;
    FileName: string;
}

const generateStyles = (muiTheme: __MaterialUI.Styles.MuiTheme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    editArea: {
        height: 'auto',
        transition: 'height 200ms ease-in-out 0ms',
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
        cursor: 'pointer',
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
        opacity: 1,
        transition: 'opacity 300ms ease-in-out 80ms'
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


class ObjectTable extends React.Component<Props, States> {
    constructor() {
        super();
        this.state = {
            showAddArea: false,
            selectedId: null,
            meshItems: [],
        } as States;
    }
    render() {
        const styles = StyleSheet.create(generateStyles(this.props.muiTheme));
        return (
            <div className={css(styles.container)}>
                <ul className={css(styles.listContainer)}>
                    {this.props.items.map((item, i) => {
                        const selected = this.state.selectedId === item.ObjectId;
                        return (
                            <ListItem
                                item={item}
                                key={`list${item.ObjectId}`}
                                style={selected ? styles.itemContainerSelected : (this.state.editing ? styles.itemContainerNotEditable: styles.itemContainer)}
                                onSelect={() => {
                                    if (!this.state.editing) {
                                        if (!selected)
                                            this.props.onItemFetchRequest(item.ObjectId,
                                                (meshes) => this.setState({ selectedId: item.ObjectId, meshItems: meshes } as States))
                                        else this.setState({ selectedId: null, meshItems: [] } as States)
                                    }
                                }}
                                onDeleteClick={() => { this.props.onDeleteRequest(item.ObjectId) }}
                                onEditStart={() => {
                                    if (this.state.editing) {
                                        return false;
                                    } else {
                                        this.setState({ editing: true} as States)
                                        if (!selected)
                                            this.props.onItemFetchRequest(item.ObjectId,
                                                (meshes) => this.setState({ selectedId: item.ObjectId, meshItems: meshes } as States))
                                        return true;
                                    }
                                }}
                                onEditComplete={(updated: Item) => {
                                    this.setState({ editing: false } as States);
                                    this.props.onUpdateItemRequest(updated);
                                }}
                                editable={!this.state.editing || selected}
                                check_id={this.check_id}
                            />
                        );
                    })}

                    <li className={css(styles.itemContainer, this.state.showAddArea ? styles.editArea : styles.editAreaHidden)} >
                        <TextField id="txt_id" type="number"
                            floatingLabelText={this.state.showAddArea ? "id" : undefined}
                            style={{ flexBasis: '100%' }}
                            onChange={(ev, txt) => {
                                const [id, message] = this.check_id(txt)
                                this.setState({ new_id: id, error_id: message } as States);
                            }}
                            errorText={this.state.error_id}
                        />
                        <TextField id="txt_name"
                            floatingLabelText={this.state.showAddArea ? "name" : undefined}
                            style={{ flexBasis: '100%' }}
                            errorText={this.state.error_name}
                            onChange={(ev, txt) => {
                                this.setState({ new_name: txt, error_name: null } as States);
                            }}
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
                                if (this.state.new_id && this.state.new_name && this.state.new_filename) {
                                    this.props.onNewItemRequest({
                                        ObjectId: this.state.new_id,
                                        Name: this.state.new_name,
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

                <MeshList
                    ObjectId={this.state.selectedId}
                    items={this.state.meshItems}
                    onDeleteRequest={() => {  }}
                    onUpdateItemRequest={(item: MeshItem) => {
                        this.props.onUpdateMeshRequest(item, (res) => {
                            this.props.onItemFetchRequest(this.state.selectedId,
                                (meshes) => this.setState({ meshItems: meshes } as States));
                        });
                    }}
                />
            </div>
        );
    }
    private check_id: (txt: string) => [number, string] = (txt: string) => {
        const id = parseInt(txt);
        if (!isNaN(id)) {
            if (this.props.items.every((e) => e.ObjectId !== id))
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
    check_id: (txt: string) => [number, string];
}
type ListItemStates = {
    editing: boolean;
    new_name: string;
}

class ListItem extends React.Component<ListItemProps, ListItemStates> {
    constructor(props: ListItemProps) {
        super();
        this.state = {
            editing: false,
            new_id: props.item.ObjectId,
            new_name: props.item.Name,
        } as ListItemStates; 
    }

    render() {
        return (
            <li className={css( this.props.style )}
                onClick={() => this.props.onSelect(this.props.item.ObjectId)}
            >
                <div>{this.state.editing ?
                    <TextField floatingLabelText="ObjectId" defaultValue={this.props.item.ObjectId}
                        disabled={true}
                    /> :
                    this.props.item.ObjectId}</div>
                <div>{this.state.editing ?
                    <TextField floatingLabelText="Name" defaultValue={this.props.item.Name}
                        onChange={(ev, txt) => {
                            this.setState({ new_name: txt } as ListItemStates);
                        }}
                    /> :
                    this.props.item.Name}</div>
                <div>{this.state.editing ?
                    <TextField floatingLabelText="FileName" defaultValue={this.props.item.FileName} disabled={true} /> :
                    this.props.item.FileName}</div>
                <div style={{
                        visibility: this.props.editable ? 'visible' : 'hidden',
                        opacity: this.props.editable ? 1 : 0,
                    }}>
                    {this.state.editing ?
                        <FloatingActionButton zDepth={0} mini={true}
                            onTouchTap={() => {
                                this.props.onEditComplete({
                                    ObjectId: this.props.item.ObjectId,
                                    Name: this.state.new_name,
                                    FileName: this.props.item.FileName
                                });
                                this.setState({ editing: false });
                            }}
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
                            onTouchTap={() => { this.props.onDeleteClick(this.props.item.ObjectId); }}
                        ><ContentDel /></FloatingActionButton> : null
                    }
                </div>
            </li>
        );
    }
}



export default (
    muiThemeable()((props: Props) => (<ObjectTable {...props} />))
)
