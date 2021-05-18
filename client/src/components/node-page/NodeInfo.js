
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
            </div>
        )
    }


    createNodeInfo() {
        let result = [];

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