import { Grommet, Header, Grid, Box} from "grommet";
import NavigationBar from '../NavigationBar';
import React from "react";
import { SETUP, COLORS } from '../../style/constants'

export default class AboutPageMain extends React.Component {

    render() {
        return <Grommet style={{ width: "100%", height: "100%" }}>
            <Header style={{ width: '100%', height: `${SETUP.header_height}%`, backgroundColor: COLORS.nav }}>
                <NavigationBar title={'About Page'}></NavigationBar>
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
                                of Nodes which participate in XRP Ledger in an intuitive way.
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
                                This tool's primary audience is operators of Nodes on the network.
                                They can gather information about the security of each Node and its peers,
                                and make improvements to their own Node's configuration if necessary.

                                Also, everyone that wants to take a look around, explore the network,
                                and learn about it.
                            </p>
                        </Box>
                        <Box align='center' margin={{ top: "1%", left: "10%", right: "10%", bottom: "3%" }}>
                            <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>A note on security</h1>
                            <p>
                                We have developed a security metric, which measures how secure a particular Node is.
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
                                <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>The Stock Node page</h1>
                                <p>
                                    Stock Nodes are responsible for relaying client transactions throughout the network
                                    and they also provide an API for getting information about themselves and the network itself.
                                    You can find relevant information about each stock Node on the network on our <a href='/'>Dashboard</a>,
                                    as well as a map that shows their geo-locations.
                                </p>
                            </Box>
                            <Box gridArea="validator" align='center' margin={{ top: "2%", left: "3%", right: "3%", bottom: "3%" }}>
                                <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>The Validator Node page</h1>
                                <p>
                                    Validator Nodes are responsible for determining the next Ledger Version in the blockchain.
                                    This is done on the basis of consensus between the Validators' votes. Learn more about the
                                    consensus protocol <a href='https://xrpl.org/intro-to-consensus.html'>here</a>.
                                    Our Validator page provides an overview of Validators with information such as
                                    associated domain and trust score.
                                </p>
                            </Box>
                            <Box gridArea="node" align='center' margin={{ top: "2%", left: "3%", right: "6%", bottom: "3%" }}>
                                <h1 style={{ fontSize: "150%", fontWeight: "bold" }}>The Node page</h1>
                                <p>
                                    Here you can find more in-depth information about each Node.
                                    This includes information such as IP address and open ports and services running on them.
                                    You can also find a graph of the Node's peers, colored based on their security score,
                                    as well as a chart of the historical performance of the Node.
                            </p>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
            </main>
        </Grommet>
    }
}
