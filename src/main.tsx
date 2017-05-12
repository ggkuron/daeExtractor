import * as React from 'react';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';
import ObjectTable, { Item as ObjectItem } from './object';
import MeshTable, { ItemSummary as MeshItemSummary, Item as MeshItem } from './mesh';
import TextureList, { Item as TextureItem } from './texture';
import {Tabs, Tab} from 'material-ui/Tabs';

import { ActionDispatcher } from './Container';
import { ObjectState } from './module';

injectTapEventPlugin();

export interface Props   {
    value: ObjectState;
    action: ActionDispatcher;
} 
type States = {
    objects: ObjectItem[];
    textures: TextureItem[];
}

const styles = {
    tabs: {
        backgroundColor: 'rgb(249,249,249)',
        minHeight: '100vh',
    },
    contentContainer: {
        padding: '15px 30px',
    },
    inkBar: {
        height: 6,
        borderRadius: 0,
        bottom: 4,
    }
}

const ApiServerOrigin = 'http://127.0.0.1:3000';

const theme: __MaterialUI.Styles.MuiTheme = {
    palette: {
        primary1Color: 'rgb(146,153,160)',
        accent1Color: 'rgb(26,172,191)',
    }
}; 

export default class MyApp extends React.Component<Props, States> {
    constructor() {
        super();
        this.state = {
            objects: [],
            textures: [],
        };
    }

    private fetch_objects = (acition: ((items: ObjectItem[]) => void)) =>  {
        fetch(`${ApiServerOrigin}/objects`, {method: 'GET'}).then((res: any) => {
            if (res.ok) return res.json().then((json: ObjectItem[]) => acition(json))
            else console.log('object fetch failure');
        })
    }
    private fetch_mesh = (id: number, action: ((items: MeshItemSummary[]) => void)) => {
        fetch(`${ApiServerOrigin}/object/${id}`, {method: 'GET'}).then((res: any) => {
            if (res.ok) return res.json().then((json: MeshItemSummary[]) => action(json))
            else console.log('mesh fetch failure');
        })
    }
    private fetch_textures = (acition: ((items: TextureItem[]) => void)) =>  {
        fetch(`${ApiServerOrigin}/textures`, {method: 'GET'}).then((res: any) => {
            if (res.ok) return res.json().then((json: TextureItem[]) => acition(json))
            else console.log('texture fetch failure');
        })
    }
    private fetch_objects_and_set = () => { this.fetch_objects((items) => this.setState({ objects: items } as States))}
    private fetch_textures_and_set = () => { this.fetch_textures((items) => this.setState({ textures: items } as States))}

    componentWillMount = () => {
        this.fetch_objects_and_set();
        this.fetch_textures_and_set();
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
                <Tabs
                    style={styles.tabs}
                    contentContainerStyle={styles.contentContainer}
                    inkBarStyle={styles.inkBar}
                >
                    <Tab label="Object">
                        <ObjectTable
                            items={this.state.objects}
                            onNewItemRequest={(item) => {
                                fetch(`${ApiServerOrigin}/object/new`,
                                    { method: 'PUT',
                                      body: JSON.stringify(item)
                                    }).then((res: any) => this.fetch_objects_and_set())
                            }}
                            onDeleteRequest={(id) => {
                                fetch(`${ApiServerOrigin}/object/delete/${id}`,
                                    { method: 'DELETE',
                                    }).then((res: any) => this.fetch_objects_and_set())
                            }}
                            onItemFetchRequest={(id, action) => {
                                this.fetch_mesh(id, (meshes) => action(meshes))
                            }}
                            onUpdateItemRequest={(item) => {
                                fetch(`${ApiServerOrigin}/object/update`,
                                    { method: 'PUT',
                                      body: JSON.stringify(item)
                                    }).then((res: any) => this.fetch_objects_and_set())
                            }}
                            onUpdateMeshRequest={(item, completed) => {
                                fetch(`${ApiServerOrigin}/mesh/update`,
                                    { method: 'PUT',
                                      body: JSON.stringify(item)
                                    }).then((res: any) => completed(res.body))
                            }}
                        />
                    </Tab>
                    <Tab label="Texture">
                        <TextureList
                            items={this.state.textures}
                            onNewItemRequest={(item) => {
                                fetch(`${ApiServerOrigin}/texture/new`,
                                    { method: 'PUT',
                                      body: JSON.stringify(item)
                                    }).then((res: any) => this.fetch_textures_and_set())
                            }}
                            onDeleteRequest={(id) => {
                                fetch(`${ApiServerOrigin}/texture/delete/${id}`,
                                    { method: 'DELETE',
                                    }).then((res: any) => this.fetch_textures_and_set())
                            }}
                            onUpdateItemRequest={(item) => {
                                fetch(`${ApiServerOrigin}/texture/update`,
                                    { method: 'PUT',
                                      body: JSON.stringify(item)
                                    }).then((res: any) => this.fetch_textures_and_set())
                            }}
                        />
                    </Tab>
                  </Tabs>
            </MuiThemeProvider>
        );
    }
}
