import { Node } from "./node";

// A connection between two Nodes
// start_node and end_node are 
export interface Connection {
    start_node: Node,
    end_node: Node
}