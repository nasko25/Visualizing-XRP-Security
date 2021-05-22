
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
            <Grommet
                theme={{ global: { colors: { doc: '#C3C3C3', t: "#000000"} } }} >

                <Header background="doc" height="xsmall" >
                    {/* <Nav direction="row"  align="center">
                        <Heading size="3xl" weight="bold" color="t">Node Page</Heading>
                        <Button>Back to Homepage</Button>
                        <TextInput size="small"/>
                    </Nav> */}

                    <Grid
                        size="auto"
                        rows={["small"]}
                        columns={["large", "medium", "medium"]}
                        areas={[
                            { name: 'heading', start: [0, 0], end: [0, 0] },
                            { name: 'button_return', start: [1, 0], end: [1, 0] },
                            { name: 'search', start: [2, 0], end: [2, 0] },
                        
                        ]}>
                            <Box gridArea="heading" aria-expanded="true" background="brand"></Box>
                            <Box gridArea="button_return" size="auto"></Box>
                            <Box gridArea="search"size="auto" ></Box>
                    </Grid>
                </Header>

                <Main>
                    <Grid
                        rows={["large", "medium"]}
                        columns={["large", "large"]}
                        areas={[
                            { name: 'map', start: [0, 0], end: [0, 0] },
                            { name: 'stats', start: [0, 1], end: [0, 1] },
                            { name: 'info', start: [1, 0], end: [2, 0] },
                        
                        ]}>
                           <Box gridArea="map" background="doc">{/*  */}
                                Map
                           </Box>
                           <Box gridArea="stats" background="doc">
                               Stats
                           </Box>
                           <Box gridArea="info" background="doc" color="doc">
                               Info
                           </Box>
                        
                    </Grid>
                        
                </Main>

            </Grommet>
        );
    }
}

export default NodePageMain;