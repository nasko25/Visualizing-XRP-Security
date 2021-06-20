import { History, LocationDescriptor } from 'history';

// The properties that should be passed in JSX to this component
export type NodePageProps = {
    history: History
}

// How the state should look like
export type NodePageState = {
    public_key: string,
    peers: Peer[],
    security_score: number,
    IP: string,
    rippled_version: string,
    ports: Port[],
    historical_scores: HistoricalScore[],
    uptime: number
}

// How the info should be passed around
export type NodeInfo = {
    public_key: string,
    peers: Peer[],
    trust_score: number,
    IP: string,
    rippled_version: string,
    ports: Port[],
    history: HistoricalScore[],
    uptime: number
}

/**
 * Ports is a string of all the port numbers, divided by a comma
 * Protocols is a string of all the protocols, divided by a comma
 */
export type NodeInfoDB = {
    public_key: string,
    IP: string,
    rippled_version: string,
    uptime: number,
    ports: string,
    protocols: string,
    longtitude: number,
    latitude: number,
    timestamp: string,
    score: number,
    history: [{average_score: number, date: Date}]
}

export type Port = {
    port_number: number,
    service: string,
    version: string
}

export type Peer = {
    public_key: string,
    score: number,
    timestamp: Date
}

export type HistoricalScore = {
    date: string,
    score: number
}

export type PeerNodeDB = {
    public_key: string,
    metric_version: string,
    score: number,
    timestamp: Date
}