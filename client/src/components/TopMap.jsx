import React from "react";
import {latLng} from "leaflet";
import {Circle, MapContainer, Popup, TileLayer, useMapEvents} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "../MarkerCluster.Default.css"


function MyComponent(props) {
    const map = useMapEvents({
        zoomend: () => {
            console.log("Mitko");
            var popup = null;
            props.that.setState({popup});
        }
    });
    return null;
}

class TopMap extends React.Component {
    state = {
        latlng: latLng(50.680797, 6.37207),
        addressPoints: {
            points: [
                {
                    latLng: [50.625073, 9.733887],
                    title: "GERMAN VERIFIER",
                    trustScore: 0,
                    connections: [5, 6],
                },
                {
                    latLng: [50.614617, 9.236633],
                    title: "GERMAN NODE",
                    trustScore: 1,
                    connections: [0, 4],
                },
                {
                    latLng: [50.071244, 8.76709],
                    title: "FRANKFURT CENTRAL NODE",
                    trustScore: 1,
                    connections: [0, 1, 4, 5],
                },
                {
                    latLng: [50.171244, 8.76709],
                    title: "A BRADWURST WAGON",
                    trustScore: 1,
                    connections: [2],
                },
                {
                    latLng: [49.98302, 8.404541],
                    title: "MAINZ CENTRAL NODE",
                    trustScore: 1,
                    connections: [5],
                },
                {
                    latLng: [49.996264, 8.275452],
                    title: "MAINZ PROXY",
                    trustScore: 1,
                    connections: [4],
                },
                {
                    latLng: [49.996264, 8.275452],
                    title: "MAINZ PROXY 2",
                    trustScore: 1,
                    connections: [4],
                },
                {
                    latLng: [51.944265, 4.394531],
                    title: "TU DELFT",
                    trustScore: 1,
                    connections: [4],
                },
                {
                    latLng: [51.910391, 4.460449],
                    title: "ROTTERDAM VERIFIER",
                    trustScore: 1,
                    connections: [4],
                },
            ],
        },
        popup: null
    };


    onClusterClick = (a) => {

            var children = a.layer.getAllChildMarkers();
            var lis = [];

            for (var child in children) {
                lis.push(<li key={"node" + child.toString()}>{children[child]._popup.options.children}</li>);
            }
            var contentForCluster = <ul>{lis}</ul>

            // Create the new popup
        var popup = null
        this.setState({ popup });
        popup = this.createNewPopup(a, contentForCluster);

        // Update the state with the new map
        this.setState({ popup });

    }

    // Create a popup with position and content
    createNewPopup = (a, content) => {
        return <Popup position={a.latlng}>{content}</Popup>
    }

    // Create a new map with the provided popup 
    createNewMap = (popup) => {
        return <MapContainer style={{width: "600px", height: "400px"}} center={this.state.latlng} zoom={3}>
            {/* Layers */}
            <TileLayer
                attribution="NO ATTRIBUTION HAHAHAHAHAHHA"
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                minZoom="2"
                maxZoom="11"
            />
            {/* Cluster Markers */}
            {this.createMarkerGroup()}
            {popup}
            <MyComponent that={this}/>
        </MapContainer>
    }

    createMarkerGroup = () => {

        let markers = [];

        for (var i = 0; i < this.state.addressPoints.points.length; i++) {
            var a = this.state.addressPoints.points[i];
            var title = a.title;
            var colour = "green";
            if (a.trustScore === 0) colour = "red";
            var size = 1000;

            let marker = (
                <Circle key={"circle_" + i}

                        center={a.latLng}
                        color={colour}
                        fillColor={colour}
                        fillOpacity={0.5}
                        radius={size}
                        title={title}
                >
                    <Popup>
                        {title}
                    </Popup>
                </Circle>

            );

            markers.push(marker);

        }

        return <MarkerClusterGroup zoomToBoundsOnClick={false} maxClusterRadius={20} onClick={this.onClusterClick}>
            {markers}
        </MarkerClusterGroup>
    };

    render = () => {
        return (
            this.createNewMap(this.state.popup)
        );
    }


}

export default TopMap;
