import { Grommet, Header, Grid, Box, Text, Heading, Paragraph } from "grommet";
import DashboardNavbar from '../dashboard/DashboardNavbar';
import React from "react";
import { History } from 'history';

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
                <DashboardNavbar history={this.props.history} />
            </Header>
            <main style={{ width: "100%", height: `${100 - SETUP.header_height}%` }}>
                <Grid
                    style={{ width: "100%", height: "100%" }}
                    rows={["1/2", "1/2"]}
                    columns={["1/2", "1/2"]}
                    areas={[
                        { name: 'general', start: [0, 0], end: [0, 0] },
                        { name: 'stock', start: [0, 1], end: [0, 1] },
                        { name: 'validator', start: [1, 0], end: [1, 0] },
                        { name: 'node', start: [1, 1], end: [1, 1] },
                    ]}
                >
                    <Box direction='row' round="1%" margin={{ top: "2%", left: "2%", right: "1%", bottom: "1%" }} gridArea="general" background={COLORS.main}>
                        {/* <Text>general</Text> */}
                        <Box style={{width: '50%', height: '100%'}} margin={{ top: "2%", left: "2%", right: "1%", bottom: "2%" }}>
                            <h1 style={{fontSize: "150%", fontWeight: "bold"}}>What is this website?</h1>
                            <Paragraph>
                                Our aim is to present important information about the XRP Ledger in an intuitive way.
                                You can read more about XRPL <a href="https://xrpl.org/" style={{color: 'white'}}>here</a>.
                                If you don't know much about the XRPL network, you can still explore the website and learn about it.
                                We achieve this by providing visualizations that represent the current state of the nework,
                                such as maps, tables and colored graphs. Have fun and keep expolring. :)
                            </Paragraph>
                        </Box>
                        <Box style={{width: '50%', height: '100%'}} margin={{ top: "2%", left: "1%", right: "2%", bottom: "2%" }}>
                            <h1 style={{fontSize: "150%", fontWeight: "bold"}}>Who is this website for?</h1>
                            <Paragraph>
                                This tool's primary audience is operators of nodes on the network.
                                They can gather information about the security of each node and its peers,
                                and make improvements to their own node's configuration if necessary.

                                Also, everyone that wants to take a look around, explore the network,
                                and learn about it.
                            </Paragraph>
                        </Box>
                    </Box>
                    <Box round="1%" margin={{ top: "1%", left: "2%", right: "1%", bottom: "2%" }} gridArea="stock" background={COLORS.main}>
                        <Text>stock</Text>
                    </Box>
                    <Box round="1%" margin={{ top: "2%", left: "1%", right: "2%", bottom: "1%" }} gridArea="validator" background={COLORS.main}>
                        <Text>validator</Text>
                    </Box>
                    <Box round="1%" margin={{ top: "1%", left: "1%", right: "2%", bottom: "2%" }} gridArea="node" background={COLORS.main}>
                        <Text>node</Text>
                    </Box>
                </Grid>
            </main>
        </Grommet>
    }
}