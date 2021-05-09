import { Node } from "./node";

// An interface for a connection between two Nodes

export interface Connection {
    start_node: Node,
    end_node: Node
}