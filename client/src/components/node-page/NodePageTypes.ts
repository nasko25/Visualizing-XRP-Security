// The properties that should be passed in JSX to this component
export type NodePageProps = {
    node_info: NodeInfo,
    key: string
}

// How the state should look like
export type NodePageState = {
    public_key: string,
    node_info: NodeInfo,
    speed: number,
    displayButton: boolean,
    displayGreen: boolean
}

// How the info should be passed around
export type NodeInfo = {
    public_key: string,
    peers: Peer[],
    trust_score: number,
    IP: string,
    rippled_version: string,
    ports: Port[],
    history: HistoricalScore[]
}

export type Port = {
    port_number: number,
    service: string,
    version: string
}

export type Peer = {
    public_key: string,
    score: number
}

export type HistoricalScore = {
    date: string,
    score: number
}