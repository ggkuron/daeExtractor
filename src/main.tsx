import * as React from 'react';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';
import ObjectTable, { Item as ObjectItem } from './object';
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
}

const styles = {
    tabs: {
        marginTop: 50,
    },
    contentContainer: {
        padding: '15px 30px',
    },
}

const ApiServerOrigin = 'http://localhost:3000';

export default class MyApp extends React.Component<Props, States> {
    constructor() {
        super();
        this.state = {
            objects: []
        };
    }

    componentWillMount = () => {
        (async () => {
            const items = await (async() => {})()
        })()
        fetch(`${ApiServerOrigin}/objects`, {method: 'GET'}).then((res: any) => {
            if (res.ok) {
                return res.json().then((json: ObjectItem[]) => {
                    this.setState({ objects: json } as States);
                })
            } else {
                console.log('network problem?')
            }

        })
        // this.props.onFetchRequest();
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <Tabs style={styles.tabs} contentContainerStyle={styles.contentContainer}>
                    <Tab label="Object">
                        <ObjectTable items={this.state.objects} />
                    </Tab>
                    <Tab label="Texture">
                      <div>
                        <TextField 
                           floatingLabelText="foo"
                        />
                      </div>
                    </Tab>
                  </Tabs>
            </MuiThemeProvider>
        );
    }
}
