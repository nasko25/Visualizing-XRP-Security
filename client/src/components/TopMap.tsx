import React from "react";
import { LatLng, latLng } from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "../MarkerCluster.Default.css"
import { List } from 'grommet';
import { History } from 'history';

// TODO Define props.data type
// Replace JSX.Element

function MyComponent(props: { that: TopMap }) {
    useMapEvents({
        zoomend: () => {
            var popup = null;
            props.that.setState({ popup });
        }
    });
    return null;
}

export type Point = {
    latitude: number,
    longtitude: number,
    public_key: string,
    score: number
}

type Props = {
    data: Point[],
    handleChange: (pub_key: string) => void,
    history: History
}

type TopMapState = {
    latlng: LatLng,
    addressPoints: {
        points: Point[],
    },
    popup: JSX.Element | null
}

class TopMap extends React.Component<Props, TopMapState> {

    state: TopMapState = {
        latlng: latLng(50.680797, 6.37207),
        addressPoints: {
            points: [],
        },
        popup: null
    };

    constructor(props: Props) {
        super(props);
        this.state.addressPoints.points = props.data;
        this.selectNode = this.selectNode.bind(this);
    }

    selectNode(pub_key: string) {
        this.props.handleChange(pub_key);
    }

    getColor(score: number): string {
        let steps = 1;
        var bif = Math.ceil((steps+2)*(Math.max(1,score))/100)-1;
        let green = Math.min(bif*(510/(steps+1)),255);
        let red = 255- Math.max(0,(bif-1)*(255/(2*((steps)/3)))-255);

        return 'rgb('+ `${red}`+ ',' + `${green}` + ',0)';
    }

    onClusterClick = (a: any) => {
        var children = a.layer.getAllChildMarkers();
        // var lis = [];
        var keys: Object[] = [];

        for (var child in children) {
            // lis.push(<li key={"node" + child.toString()}>{children[child]._popup.options.children}</li>);
            keys.push({ pub_key: children[child]._popup.options.children });
        }
        // var contentForCluster = <ul>{lis}</ul>

        var contentForCluster = <List primaryKey="pub_key" data={keys} style={{color:'white', overflowX: 'hidden', marginRight: '10px'}}/>

        // Create the new popup
        var popup = null;
        this.setState({ popup });
        popup = this.createNewPopup(a, contentForCluster);

        // Update the state with the new map
        this.setState({ popup });

    }

    // Create a popup with position and content
    createNewPopup = (a: { latlng: LatLng }, content: JSX.Element) => {
        return <Popup position={a.latlng} maxHeight={200} maxWidth={300}>{content}</Popup>
    }

    // Create a new map with the provided popup 
    createNewMap = (popup: JSX.Element | null) => {
        return <MapContainer className='map' center={this.state.latlng} zoom={3} data-testid='dashboard-map' maxBounds={[[100, -220],[-100, 220]]}>
            {/* Layers */}
            <TileLayer
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                minZoom={2}
                maxZoom={11}
            />
            {/* Cluster Markers */}
            {this.createMarkerGroup()}
            {popup}
            <MyComponent that={this} />
        </MapContainer>
    }

    createMarkerGroup = () => {
        let markers = [];

        for (var i = 0; i < this.props.data.length; i++) {
            let a: Point = this.props.data[i];
            // var title  = a.title;
            var title = a.public_key;
            var colour: string = this.getColor(a.score);

            // Nodes still don't have trust score
            // Uncomment when trust score is implemented
            // if (a.trustScore === 0) colour = "red";
            var size = 10;
            if (a.latitude == null || a.longtitude == null) {
                continue;
            }

            let url: string = "/node?public_key=" + a.public_key;

            let marker = (
                <CircleMarker 
                    key={"circle_" + i}
                    center={[a.latitude, a.longtitude]}
                    color={colour}
                    fillColor={colour}
                    fillOpacity={0.5}
                    radius={size}
                    eventHandlers={{
                        click: () => {
                            this.selectNode(a.public_key);
                        }
                    }}
                >
                    <Popup>
                        <a href={url}>{title}</a>
                    </Popup>
                </CircleMarker>

            );
            markers.push(marker);
        }
        return <MarkerClusterGroup zoomToBoundsOnClick={false} maxClusterRadius={28} onClick={this.onClusterClick}>
            {markers}
        </MarkerClusterGroup>
    };

    render = () => {
        return (
            <div className='map-outer'>
                {this.createNewMap(this.state.popup)}
            </div>
        );
    }
}

export default TopMap;
