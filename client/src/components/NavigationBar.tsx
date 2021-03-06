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
type NavigationBarProps = {
    title: string
}

/**
 * This component displays the Navigation bar on the Node page
 * It has buttons to navigate through the website, as well
 * as a search bar, which expects a public_key.
 */
export default class NavigationBar extends Component<NavigationBarProps>{

    constructor(props: NavigationBarProps) {
        super(props);

        this.onKeyPressSearch = this.onKeyPressSearch.bind(this);
    }

    searchID: string = "node-page-search-bar";

    /**
     * Event Handler for the Search Bar
     */
    onKeyPressSearch(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.code === "Enter") {
            let text: string = (document.getElementById(this.searchID) as HTMLInputElement).value;
            window.location.href = `/node?public_key=${text}`;
        }
    }

    render() {
        return (<Grid
            style={{ width: "100%", height: "100%", color: "white" }}
            rows={["1"]}
            columns={["12.5%", "12.5%", "12.5%", "12.5%", "37.5%", "12.5%"]}
            areas={[
                { name: 'logo', start: [0,0], end: [0,0] },
                { name: 'heading', start: [5, 0], end: [5, 0] },
                { name: 'button_stock', start: [1, 0], end: [1, 0] },
                { name: 'button_validator', start: [2, 0], end: [2, 0] },
                { name: 'button_about', start: [3, 0], end: [3, 0] },
                { name: 'search', start: [4, 0], end: [4, 0] },
            ]}>

            {/* The logo. */}
            <Box
                gridArea="logo"
                alignSelf="center"
                justify="center"
                style={{ width: "100%", height: "100%" }}
            >
                {/* <Text style={{ fontWeight: "bold", userSelect: 'none'}} size='3xl'>CISELab</Text> */}
                <a href='/' data-testid="" style={{userSelect: 'none', fontSize:'200%'}}>CISELab</a>
            </Box>

            {/* The heading. */}
            <Box
                gridArea="heading"
                alignSelf="center"
                justify="center"
                style={{ width: "100%", height: "100%" }}
            >
                <Text style={{ fontWeight: "bold", fontSize: "x-large", userSelect: 'none', MozUserSelect: 'none', WebkitUserSelect: 'none' }}>{this.props.title}</Text>
            </Box>

            {/* The Button for returning to the main page. */}
            <Box
                gridArea="button_stock"
                justify="center"
                alignSelf="center"
                style={{ width: "100%", height: "100%" }}
            >
                {
                    this.props.title !== "Dashboard" ?
                        <a className='onPage' href='/' data-testid="stock-ref" style={{userSelect: 'none'}}>Stock Nodes</a>
                        :
                        <Text style={{ fontWeight: "bold", fontSize: "x-large", userSelect: 'none', MozUserSelect: 'none', WebkitUserSelect: 'none'}}>Stock Nodes</Text>
                    
                }
            </Box>

            {/* The Button for going to the validator page. */}
            <Box
                gridArea="button_validator"
                justify="center"
                alignSelf="center"
                style={{ width: "100%", height: "100%" }}
            >
                {
                    this.props.title !== "Validators" ?
                        <a href='/validators' data-testid="validators-ref" style={{userSelect: 'none'}}>Validator Nodes</a>
                        :
                        <Text style={{ fontWeight: "bold", fontSize: "x-large", userSelect: 'none', MozUserSelect: 'none', WebkitUserSelect: 'none' }}>Validator Nodes</Text>
                }
            </Box>

            {/* The Button for going to the about page. */}
            <Box
                gridArea="button_about"
                justify="center"
                alignSelf="center"
                style={{ width: "100%", height: "100%" }}
            >
                {
                    this.props.title !== "About Page" ?
                        <a href='/about' data-testid="about-ref" style={{userSelect: 'none'}}>About</a>
                        :
                        <Text style={{ fontWeight: "bold", fontSize: "x-large", userSelect: 'none', MozUserSelect: 'none', WebkitUserSelect: 'none' }}>About</Text>
                }
            </Box>
            
            {/* The Search Bar */}
                <Box gridArea="search"
                alignSelf="center"
                direction="row"
                justify="center"
                background={COLORS.button}
                margin={{ left: "4%", right: "5%" }}
                >
                <TextInput
                    onKeyPress={this.onKeyPressSearch}
                    icon={<Search />}
                    textAlign="start"
                    placeholder="Search Stock Node Public Key"
                    id={this.searchID}
                    data-testid="search"
                />
                </Box>
        </Grid>)
    }
}