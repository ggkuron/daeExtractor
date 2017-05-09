import * as React from 'react';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';
import ObjectTable from './object';
import {Tabs, Tab} from 'material-ui/Tabs';

injectTapEventPlugin();

export interface Props {
}

const styles = {
    tabs: {
        marginTop: 50
    }
}

export default class MyApp extends React.Component<Props, {}> {
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                  <Tabs style={styles.tabs}>
                    <Tab label="Object">
                        <ObjectTable />
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
