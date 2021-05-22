
import React from "react";
import {Box, Button, Grid, Grommet, Header, Heading, Main, Menu, Nav, Tab, Table, TableBody, TableCell, TableHeader, TableRow, Text, TextInput} from 'grommet'


class NodePageMain extends React.Component {
    
    state = {
        
    };

    constructor(props) {
        super(props);
        
    }

    render() {
        return (
            <Grommet style={{width:"100%", height:"100%"}}
                theme={{ global: { colors: { doc: '#C3C3C3', t: "#000000"} } }} >

                <Header background="doc" style={{width:"100%", height:"10%"}} >
                    <Grid
                        style={{width: "100%", height: "100%"}}
                        rows={["xsmall"]}
                        gap="medium"
                        columns={["1/5", "2/5", "2/5"]}
                        areas={[
                            { name: 'heading', start: [0, 0], end: [0, 0] },
                            { name: 'button_return', start: [1, 0], end: [1, 0] },
                            { name: 'search', start: [2, 0], end: [2, 0] },
                        
                        ]}>
                            <Box gridArea="heading" alignSelf="center" ><Heading size="3xl" weight="bold" color="t">Node Page</Heading></Box>
                            <Box height="80%" gridArea="button_return" justify="center" alignSelf="center" background="#909090"><Button alignSelf="center" style={{width: "80%"}}><Text color="#383838" size="large" weight="bold">Back To Homepage</Text></Button></Box>
                            <Box gridArea="search" alignSelf="center" direction="row" alignSelf="center" justify="center" gap="small"><Text alignSelf="center" weight="bold">Search</Text><TextInput size="small"/></Box>
                    </Grid>
                </Header>

                <Main style={{width:"100%", height:"90%"}} >
                    
                </Main>

            </Grommet>
        );
    }
}

export default NodePageMain;