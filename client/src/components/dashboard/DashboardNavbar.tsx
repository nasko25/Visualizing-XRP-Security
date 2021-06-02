import { Grid, Heading, Box, Text } from "grommet";
import { Component } from "react";
import Button from 'react-bootstrap/Button'
import { Link } from "react-router-dom";
import { History } from 'history';

export type DashboardNavbarProps = {
    history: History
}

export default class DashboardNavbar extends Component<DashboardNavbarProps> {
    render() {
        return (
            <Grid
                style={{ width: "100%", height: "100%" }}
                    rows={["1"]}
                    columns={["1/2", "1/4", "1/4"]}
                    areas={[
                        { name: 'title', start: [0, 0], end: [0, 0] },
                        { name: 'button_validator', start: [1, 0], end: [1, 0] },
                        { name: 'button_about', start: [2,0], end: [2,0]}
                    ]}
            >
                <Heading margin="2%" gridArea="title" alignSelf="center" size="small" color='#f8f8f8'>CISELab</Heading>

                <Box
                    height="80%"
                    gridArea="button_validator"
                    justify="center"
                    alignSelf="center"
                    margin="2%">
                    <Button
                        variant="dark"
                        style={{ width: "80%", height: "80%", alignSelf: "center" }} 
                        onClick={() => this.props.history.push('/validators')}
                        >
                        <Text contentEditable="false" size="large" weight="bold">Validators</Text>
                    </Button>
                </Box>

                <Box
                    height="80%"
                    gridArea="button_about"
                    justify="center"
                    alignSelf="center"
                    margin="2%">
                    <Button
                        variant="dark"
                        style={{ width: "80%", height: "80%", alignSelf: "center" }} 
                        onClick={() => this.props.history.push('/about')}
                        >
                        <Text contentEditable="false" size="large" weight="bold">About</Text>
                    </Button>
                </Box>
            </Grid>
        )
    }
}