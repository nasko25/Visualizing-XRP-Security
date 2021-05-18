import React from "react";
import NodePopup from "./NodePopup";

const CSS_CLASSES =  {
    node_info_main: "main",
    node_info_item: "list_item"
}

class NodeInfo extends React.Component {

    state = {
        node: null
    }

    /**
     * Initializes the state:
     *  * node - the node information to display
     *
     * */
    constructor(props) {
        super(props);
        this.state.node = props.node;
    }

    render() {
        return (
            <div className={CSS_CLASSES.node_info_main}>
                {this.createNodeInfo()}

                <NodePopup node_info={{
                    public_key: "n9MozjnGB3tpULewtTsVtuudg5JqYFyV3QFdAtVLzJaxHcBaxuXD",
                    IP: "34.221.161.114",
                    peers: [{trust_score: 0.3}, {trust_score: 0.8}, {trust_score: 0.9}, {trust_score: 0.1}],
                    trust_score: 1
                }}/>


            </div>

        )
    }


    createNodeInfo() {
        let result = [];
        let node = this.state.node;

        // Iterate the keys
        for (let key in node) {
            if(key === 'peers')
                result.push(this.createPeersInfo(node[key]));
            else
                result.push(<div id={key} className={CSS_CLASSES.list_item}>{key} : {node[key]} </div>)
        }

        return result;
    }

    createPeersInfo(peers) {
        return <div id="peers" className={CSS_CLASSES.list_item}> peers : [] </div>;
    }
}

export default NodeInfo;