// An interface for a  Node on the network

export interface Node {
    IP: string,
    rippled_version: string,
    public_key: string,
    uptime: number
}
