import { Grommet, Header } from "grommet";
import { Component } from "react";
import ValidatorPageNav from './ValidatorPageNav';


var SETUP = {
    header_height: 7.5,
    hd_bgnd: '#C3C3C3',
}

var COLORS = {
    main: "#383838",
    button: "#212529",
    nav: "#1a1a1a"
}

export default class ValidatorPageMain extends Component {



    render() {
        return(
            <Grommet style={{height: '100%', width: '100%'}}>
                <Header style={{width: '100%', height: `${SETUP.header_height}%`, backgroundColor: COLORS.nav}}>
                    <ValidatorPageNav />
                </Header>
            </Grommet>
        );
    }
}