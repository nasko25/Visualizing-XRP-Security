import { Grommet, Header, Grid, Box, Text, Heading, Paragraph } from "grommet";
import DashboardNavbar from '../dashboard/DashboardNavbar';
import React from "react";
import { History } from 'history';
import Button from 'react-bootstrap/Button'

type AboutPageProps = {
    history: History
}

type AboutPageState = {

}

var SETUP = {
    header_height: 7.5,
    hd_bgnd: '#C3C3C3',
}

var COLORS = {
    main: "#383838",
    button: "#212529",
    nav: "#1a1a1a"
}

export default class AboutPageMain extends React.Component<AboutPageProps, AboutPageState> {

    constructor(props: AboutPageProps) {
        super(props);
    }

    render() {
        return <Grommet style={{ width: "100%", height: "100%" }}>
            <Header style={{ width: '100%', height: `${SETUP.header_height}%`, backgroundColor: COLORS.nav }}>
                <Grid
                    style={{ width: "100%", height: "100%" }}
                    rows={["1"]}
                    columns={["1/2", "1/4", "1/4"]}
                    areas={[
                        { name: 'title', start: [0, 0], end: [0, 0] },
                        { name: 'button_stock', start: [1, 0], end: [1, 0] },
                        { name: 'button_validator', start: [2, 0], end: [2, 0] }
                    ]}
                >
                    <Heading margin="2%" gridArea="title" alignSelf="center" size="small" color='#f8f8f8'>CISELab</Heading>

                    <Box
                        height="80%"
                        gridArea="button_stock"
                        justify="center"
                        alignSelf="center"
                        margin="2%">
                        <Button
                            variant="dark"
                            style={{ width: "80%", height: "80%", alignSelf: "center" }}
                            onClick={() => this.props.history.push('/')}
                        >
                            <Text contentEditable="false" size="large" weight="bold">Stock nodes</Text>
                        </Button>
                    </Box>

                    <Box
                        height="80%"
                        gridArea="button_validator"
                        justify="center"
                        alignSelf="center"
                        margin="2%">
                        <Button
                            variant="dark"
                            style={{ width: "80%", height: "80%", alignSelf: "center" }}
                            onClick={() => this.props.history.push('/validator')}
                        >
                            <Text contentEditable="false" size="large" weight="bold">Validators</Text>
                        </Button>
                    </Box>
                </Grid>
            </Header>
            <main style={{ width: "100%", height: `${100 - SETUP.header_height}%` }}>
                <Grid
                    style={{ width: "100%", height: "100%" }}
                    rows={["1/2", "1/2"]}
                    columns={["1/2", "1/2"]}
                    areas={[
                        { name: 'general', start: [0, 0], end: [1, 1] }
                    ]}
                    align='center'
                >
                    <Box round="1%" margin={{ top: "2%", left: "2%", right: "2%", bottom: "2%" }} gridArea="general" background={COLORS.main}>
                        <Box align='center' margin={{ top: "2%", left: "10%", right: "10%", bottom: "1%" }}>
                            <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>What is this website?</h1>
                            <p style={{ width: '100%', height: '100%' }}>
                                Our aim is to present important information about the security and trustability
                                of nodes which participate in XRP Ledger in an intuitive way.
                                We achieve this by providing visualizations that represent the current state of the nework,
                                such as maps, tables and colored graphs.
                                You can read more about XRPL <a href="https://xrpl.org/">here</a>.
                                If you don't know much about the XRPL network, you can still explore the website and learn about it.
                                Have fun and keep expolring. :)
                            </p>
                        </Box>
                        <Box align='center' margin={{ top: "3%", left: "10%", right: "10%", bottom: "3%" }}>
                            <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>Who is this website for?</h1>
                            <p>
                                This tool's primary audience is operators of nodes on the network.
                                They can gather information about the security of each node and its peers,
                                and make improvements to their own node's configuration if necessary.

                                Also, everyone that wants to take a look around, explore the network,
                                and learn about it.
                            </p>
                        </Box>
                        <Box align='center' margin={{ top: "1%", left: "10%", right: "10%", bottom: "3%" }}>
                            <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>A note on security</h1>
                            <p>
                                We have developed a security metric, which measures how secure a particular node is.
                                This metric takes into account...(fill in later)
                                One must look beyond the number.
                            </p>
                        </Box>
                        <Grid
                            style={{ width: "100%", height: "100%" }}
                            rows={["100%"]}
                            columns={["1/3", "1/3", "1/3"]}
                            areas={[
                                { name: 'stock', start: [0, 0], end: [0, 0] },
                                { name: 'validator', start: [1, 0], end: [1, 0] },
                                { name: 'node', start: [2, 0], end: [2, 0] },
                            ]}>
                            <Box gridArea="stock" align='center' margin={{ top: "2%", left: "6%", right: "3%", bottom: "3%" }}>
                                <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>The Stock node page</h1>
                                <p>
                                    Stock nodes are responsible for relaying client transactions throughout the network
                                    and they also provide an API for getting information about themselves and the network itself.
                                    You can find relevant information about each stock node on the network on our <a href='/'>Dashboard</a>,
                                    as well as a map that shows their geo-locations.
                                </p>
                            </Box>
                            <Box gridArea="validator" align='center' margin={{ top: "2%", left: "3%", right: "3%", bottom: "3%" }}>
                                <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>The Validator node page</h1>
                                <p>
                                    Validator nodes are responsible for determining the next Ledger Version in the blockchain.
                                    This is done on the basis of consensus between the Validators' votes. Learn more about the
                                    consensus protocol <a href=''>here</a>.
                                    Our Validator page provides an overview of Validators with information such as
                                    associated domain and trust score.
                                </p>
                            </Box>
                            <Box gridArea="node" align='center' margin={{ top: "2%", left: "3%", right: "6%", bottom: "3%" }}>
                                <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>The Node page</h1>
                                <p>
                                    Here you can find more in-depth information about each node.
                                    This includes information such as IP address and open ports and services running on them.
                                    You can also find a graph of the node's peers, colored based on their security score,
                                    as well as a chart of the historical performance of the node.
                            </p>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
            </main>
        </Grommet>
    }
}