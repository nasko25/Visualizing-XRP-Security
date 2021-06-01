import { Component } from "react";
import { Grid, Box, Heading, Text } from 'grommet';
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";

export default class ValidatorPageNav extends Component {
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
                        style={{ width: "80%", height: "80%", alignSelf: "center" }} >
                        <Link to='/' className='link' style={{textDecoration: 'none', color: 'inherit'}}>
                            <Text contentEditable="false" size="large" weight="bold">Stock</Text>
                        </Link>
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
                        style={{ width: "80%", height: "80%", alignSelf: "center" }} >
                        <Link to='/' className='link' style={{textDecoration: 'none', color: 'inherit'}}>
                            <Text contentEditable="false" size="large" weight="bold">About</Text>
                        </Link>
                    </Button>
                </Box>
            </Grid>
        )
    }
}