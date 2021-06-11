import { Grid, Box, TextInput, Text } from "grommet";
import { Search } from "grommet-icons"
import { Component } from "react";
import { COLORS } from '../style/constants'
import '../style/NodePage.css'

/** 
 * The onSearch is a function which should handle the searching functionality
 * 
 * The searchID is the element id of the Input where the 
 * search query is typed.
 */
type NodePageNavbarProps = {
    title: string,
    onSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    searchID: string
}

/**
 * This component displays the Navigation bar on the Node page
 * It has buttons to navigate through the website, as well
 * as a search bar, which expects a public_key.
 */
export default class NodePageNavbar extends Component<NodePageNavbarProps>{

    render(){
        return(<Grid
            style={{ width: "100%", height: "100%", color: "white" }}
            rows={["1"]}
            columns={["12.5%", "12.5%", "12.5%", "12.5%", "50%"]}
            areas={[
                { name: 'heading', start: [0, 0], end: [0, 0] },
                { name: 'button_stock', start: [1, 0], end: [1, 0] },
                { name: 'button_validator', start: [2, 0], end: [2, 0] },
                { name: 'button_about', start: [3, 0], end: [3, 0] },
                { name: 'search', start: [4, 0], end: [4, 0] },
            ]}>

            {/* The heading. */}
            <Box 
                gridArea="heading"
                alignSelf="center"
                justify="center"
                style={{width: "100%", height: "100%"}}
                >
                <Text style={{fontWeight: "bold", fontSize: "x-large"}}>{this.props.title}</Text>
            </Box>

            {/* The Button for returning to the main page. */}
            <Box
                gridArea="button_stock"
                justify="center"
                alignSelf="center"
                style={{width: "100%", height: "100%"}}
                >
                <a className='onPage' href='/'>Stock Nodes</a>
            </Box>

            {/* The Button for going to the validator page. */}
            <Box
                gridArea="button_validator"
                justify="center"
                alignSelf="center"
                style={{width: "100%", height: "100%"}}
                >
                <a href='/validators'>Validator Nodes</a>
            </Box>

            {/* The Button for going to the about page. */}
            <Box
                gridArea="button_about"
                justify="center"
                alignSelf="center"
                style={{width: "100%", height: "100%"}}
                >
                <a href='/about'>About</a>
            </Box>

            {/* The Search Bar */}
            <Box gridArea="search"
                alignSelf="center"
                direction="row"
                justify="center"
                background={COLORS.button}
                margin={{ left: "1%", right: "2%" }}
                >
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