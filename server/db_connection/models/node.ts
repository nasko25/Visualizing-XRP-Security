// An interface for a  Node on the network

export interface Node {
    node_id?: number,
    IP: string,
    rippled_verison: string,
    public_key: string,
    uptime: number
}
