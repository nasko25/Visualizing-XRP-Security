// An interface for a  Node on the network

export interface Node {
    node_id?: number,
    IP: string,
    rippled_version: string,
    public_key: string,
    uptime: number
}

export interface NodePorts {
    ip: string,
    ports: string
}
