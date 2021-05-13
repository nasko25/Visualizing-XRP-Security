// An interface for a  Node on the network

export interface Node {
    node_id?: number,
    IP: string,
    rippled_version: string,
    public_key: string,
    uptime: number
}

export interface NodePorts {
    public_key: string,
    ip: string,
    ports: string
}

export interface NodePortsProtocols {
    public_key: string,
    ip: string,
    ports: string,
    protocols: string
}