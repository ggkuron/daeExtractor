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
    error_filename: string;
};

export interface Item {
    AnimationId: number;
    ObjectId: number;
    JointIndex: number;
    Name: string;
    FileName: string;
    Target: string;
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

class AnimationList extends React.Component<Props, States> {
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
                        const selected = this.state.selectedId === item.AnimationId;
                        return (
                            <ListItem
                                item={item}
                                key={`list${i}`}
                                style={selected ? styles.itemContainerSelected : (this.state.editing ? styles.itemContainerNotEditable : styles.itemContainer)}
                                onSelect={() => {
                                    if (!this.state.editing) {
                                        if (!selected)
                                            this.setState({ selectedId: item.AnimationId } as States);
                                        else this.setState({ selectedId: null} as States)
                                    }
                                }}
                                onDeleteClick={() => {
                                    this.setState({ editing: false } as States);
                                    this.props.onDeleteRequest(item.AnimationId)
                                }}
                                onEditStart={() => {
                                    if (this.state.editing) {
                                        return false;
                                    } else {
                                        this.setState({ selectedId: item.AnimationId, editing: true } as States)
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
                            floatingLabelText={this.state.showAddArea ? "AnimationId" : undefined}
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
                                        AnimationId  : this.state.new_id,
                                        ObjectId: 0,
                                        Name: '',
                                        FileName: this.state.new_filename ,
                                        JointIndex: 0,
                                        Target: '',
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
            if (this.props.items.every((e) => e.AnimationId !== id))
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
    new_animationId: number;
    new_name: string;
    new_objectId: number;
    new_jointIndex: number;
    error_texture: string;
}

class ListItem extends React.Component<ListItemProps, ListItemStates> {
    constructor(props: ListItemProps) {
        super();
        this.state = {
            editing: false,
            new_name: props.item.Name,
            new_objectId: props.item.ObjectId,
            new_animationId: props.item.AnimationId,
            new_jointIndex: props.item.JointIndex,
        } as ListItemStates; 
    }

    componentWillReceiveProps(nextProps: ListItemProps) {
        if(this.props.item.AnimationId !== nextProps.item.AnimationId) 
            this.setState({
                editing: false,
                new_name: nextProps.item.Name,
                new_animationId: nextProps.item.AnimationId,
                new_objectId: nextProps.item.ObjectId,
                new_jointIndex: nextProps.item.JointIndex,
            })
    }

    render() {
        return (
            <li className={css( this.props.style )}
                onClick={() => this.props.onSelect(this.props.item.AnimationId)}
            >
                <div>{this.state.editing ?
                    <TextField floatingLabelText="AnimationId" defaultValue={this.props.item.AnimationId}
                        type="number"
                        disabled={true}
                    /> :
                    this.props.item.AnimationId}</div>
                <div>{this.state.editing ?
                    <TextField floatingLabelText="ObjectId" defaultValue={this.props.item.ObjectId}
                        type="number"
                        onChange={(ev, txt) => {
                            const id = parseInt(txt);
                            if (!isNaN(id)) {
                                this.setState({ new_objectId: id } as ListItemStates);
                            }
                        }}
                    /> :
                    this.props.item.ObjectId}</div>
                <div>{this.state.editing ?
                    <TextField floatingLabelText="Name" defaultValue={this.props.item.Name}
                        onChange={(ev, txt) => {
                            this.setState({ new_name: txt } as ListItemStates);
                        }}
                    /> :
                    this.props.item.Name}</div>
                <div>{this.props.item.FileName}</div>
                <div>{this.props.item.Target}</div>
                <div>{this.state.editing ?
                    <TextField floatingLabelText="JointIndex" defaultValue={this.props.item.JointIndex}
                        type="number"
                        onChange={(ev, txt) => {
                            const id = parseInt(txt);
                            if (!isNaN(id)) {
                                this.setState({ new_jointIndex: id } as ListItemStates);
                            }
                        }}
                    /> :
                    this.props.item.JointIndex}</div>
                <div style={{
                        visibility: this.props.editable ? 'visible' : 'hidden',
                        opacity: this.props.editable ? 1 : 0,
                    }}>
                    {this.state.editing ?
                        <FloatingActionButton zDepth={0} mini={true}
                            onTouchTap={() => {
                                this.props.onEditComplete({
                                    AnimationId: this.props.item.AnimationId,
                                    ObjectId: this.state.new_objectId,
                                    Name: this.state.new_name,
                                    FileName: this.props.item.FileName,
                                    Target: this.props.item.Target,
                                    JointIndex: this.state.new_jointIndex,
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
                            onTouchTap={() => {
                                this.props.onDeleteClick(this.props.item.AnimationId);
                            }}
                        ><ContentDel /></FloatingActionButton> : null
                    }
                </div>
            </li>
        );
    }
}

export default (
    muiThemeable()((props: Props) => (<AnimationList {...props} />))
)
