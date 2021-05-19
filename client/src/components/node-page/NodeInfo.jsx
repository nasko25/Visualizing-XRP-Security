import React from "react";
import ReactJson from "react-json-view";
import NodePeerGraph from "./NodePeerGraph";
import "./NodeInfo.css";

const CSS_CLASSES = {
    main: "node_info_main",
    item: "node_info_list_item",
    peer_graph: "node_info_peer_graph",
    json_view: "node_info_json_view",
};

class NodeInfo extends React.Component {
    state = {
        node: null,
        node_info: null,
    };

    /**
     * Initializes the state:
     *  * node - the node information to display
     *
     * */
    constructor(props) {
        super(props);
        // this.state.node = props.node;
        this.state.node = {
            public_key: "n9MozjnGB3tpULewtTsVtuudg5JqYFyV3QFdAtVLzJaxHcBaxuXD",
            IP: "34.221.161.114",
            peers: [
                { trust_score: 0.3 },
                { trust_score: 0.8 },
                { trust_score: 0.9 },
                { trust_score: 0.1 },
            ],
            trust_score: 1,
        };
    }

    render() {
        return (
            <div className={CSS_CLASSES.node_info_main}>
                <div className={CSS_CLASSES.peer_graph}>
                    {/* The component that shows the peers of the node using a
                    library - made in Markoland */}
                    <NodePeerGraph node_info={this.state.node} />
                </div>

                <div className={CSS_CLASSES.json_view}>
                    {/* A component that shows all the information for the node in a pretty HTML JSON view. */}
                    <ReactJson
                        name={"node"}
                        displayDataTypes={false}
                        displayObjectSize={false}
                        theme={"twilight"}
                        src={this.state.node}
                    />
                </div>
            </div>
        );
    }

    createNodeInfo() {
        let result = [];
        let node = this.state.node;

        // Iterate the keys
        for (let key in node) {
            if (key === "peers") result.push(this.createPeersInfo(node[key]));
            else
                result.push(
                    <div id={key} className={CSS_CLASSES.list_item}>
                        {key} : {node[key]}{" "}
                    </div>
                );
        }

        return result;
    }

    createPeersInfo(peers) {
        return (
            <div id="peers" className={CSS_CLASSES.list_item}>
                {" "}
                peers : []{" "}
            </div>
        );
    }
}

export default NodeInfo;
