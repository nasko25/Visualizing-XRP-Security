import { Grid, Heading, Box, Text, TextInput } from "grommet";
import { Search } from "grommet-icons"
import { Component } from "react";
import Button from 'react-bootstrap/Button'
import { History } from 'history';
import { COLORS } from '../../style/constants'

/**
 * The history represents the Browser history and is used for navigating
 * between the different pages.
 * 
 * The onSearch is a function which should handle the searching functionality
 * 
 * The searchID is the element id of the Input where the 
 * search query is typed.
 */
type NodePageNavbarProps = {
    history: History,
    onSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    searchID: string
}

/**
 * This component displays the Navigation bar on the Node page
 * It has buttons to navigate through the website, as well
 * as a search bar
 */
export default class NodePageNavbar extends Component<NodePageNavbarProps>{

    constructor(props: NodePageNavbarProps){
        super(props);
    }

    render(){
        return(<Grid
            style={{ width: "100%", height: "100%" }}
            rows={["1"]}
            columns={["1/5", "1/5", "1/5", "1/5", "1/5"]}
            areas={[
                { name: 'heading', start: [0, 0], end: [0, 0] },
                { name: 'button_stock', start: [1, 0], end: [1, 0] },
                { name: 'button_validator', start: [2, 0], end: [2, 0] },
                { name: 'button_about', start: [3, 0], end: [3, 0] },
                { name: 'search', start: [4, 0], end: [4, 0] },
            ]}>

            {/* The heading. */}
            <Heading margin="2%" gridArea="heading" alignSelf="center" size="small">Node Page</Heading>

            {/* The Button for returning to the main page. */}
            <Box
                height="80%"
                gridArea="button_stock"
                justify="center"
                alignSelf="center"
                margin="2%">
                <Button
                    variant="dark"
                    onClick={() => this.props.history.push("/")}
                    style={{ width: "80%", height: "80%", alignSelf: "center" }}
                    data-testid="stock-button" >
                    <Text size="large" weight="bold" >Stock</Text>
                </Button>
            </Box>

            {/* The Button for going to the validator page. */}
            <Box
                height="80%"
                gridArea="button_validator"
                justify="center"
                alignSelf="center"
                margin="2%">
                <Button
                    variant="dark"
                    onClick={() => this.props.history.push("/validators")}
                    style={{ width: "80%", height: "80%", alignSelf: "center" }}
                    data-testid="validators-button" >
                    <Text size="large" weight="bold">Validators</Text>
                </Button>
            </Box>

            {/* The Button for going to the about page. */}
            <Box
                height="80%"
                gridArea="button_about"
                justify="center"
                alignSelf="center"
                margin="2%">
                <Button
                    className=""
                    variant="dark"
                    onClick={() => this.props.history.push("/about")}
                    style={{ width: "80%", height: "80%", alignSelf: "center" }}
                    data-testid="about-button" >
                    <Text size="large" weight="bold">About</Text>
                </Button>
            </Box>

            {/* The Search Bar */}
            <Box gridArea="search"
                alignSelf="center"
                direction="row"
                justify="center"
                background={COLORS.button}
                margin={{ left: "1%", right: "3%" }}>
                <TextInput
                    onKeyPress={this.props.onSearch}
                    icon={<Search />}
                    textAlign="center"
                    placeholder="Search Public Key"
                    id={this.props.searchID}
                    data-testid="search"
                />
            </Box>
        </Grid>)
    }
}