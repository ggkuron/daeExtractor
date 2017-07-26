import * as React from 'react';

import MuiThemeProviderProps = __MaterialUI.Styles.MuiThemeProviderProps;
import muiThemeable from 'material-ui/styles/muiThemeable';
import { fade } from 'material-ui/utils/colorManipulator';
import { compose } from 'recompose';

import { StyleSheet, css } from 'aphrodite';

export interface ButtonProps extends MuiThemeProviderProps {
    onTouchTap?: __MaterialUI.TouchTapEventHandler,
    cssStyle?: any[],
}

function buttonWrap<P extends ButtonProps>(Comp: React.StatelessComponent<P>) {
    return function buttonWrap(p: P) {
        const styles = StyleSheet.create({
            button: {
                backgroundColor: p.muiTheme.palette.borderColor,
                color: p.muiTheme.palette.textColor,
                ":hover": {
                    backgroundColor: fade(p.muiTheme.palette.borderColor, 0.6),
                    color: p.muiTheme.palette.textColor,
                }
            },
        });
        const {
            className,
            cssStyle,
            ...rest
        } = p as any;
        return (
            <Comp
                className={css(styles.button, ...(p.cssStyle ? p.cssStyle : []))}
                {...rest}
            />
        );
    }
}

export default (
    compose(
        muiThemeable(),
        buttonWrap
    )
);
