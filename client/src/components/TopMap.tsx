import React from "react";
import {latLng} from "leaflet";
import {Circle, MapContainer, Popup, TileLayer, useMapEvents} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "../MarkerCluster.Default.css"
import Button from 'react-bootstrap/Button'


function MyComponent(props: any) {
    const map = useMapEvents({
        zoomend: () => {
            console.log("Mitko");
            var popup = null;
            props.that.setState({popup});
        }
    });
    return null;
}

type Props = {
    data: any
}

class TopMap extends React.Component<Props> {
    state = {
        latlng: latLng(50.680797, 6.37207),
        addressPoints: {
            points: [],
        },
        popup: null
    };

    constructor(props : any) {
        super(props);
        this.state.addressPoints.points = props.data;
    }


    onClusterClick = (a : any) => {

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
    createNewPopup = (a: any, content : any) => {
        return <Popup position={a.latlng}>{content}</Popup>
    }

    // Create a new map with the provided popup 
    createNewMap = (popup : any) => {
        return <MapContainer className ='map' center={this.state.latlng} zoom={3}>
            {/* Layers */}
            <TileLayer
                // attribution="NO ATTRIBUTION HAHAHAHAHAHHA"
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                minZoom={2}
                maxZoom={11}
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
            var a : any = this.state.addressPoints.points[i];
            var title  = a.title;
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
            <div className='map-group'>
                <div className='map-outer'>
                    {this.createNewMap(this.state.popup)}
                </div>
                <div className='button-show-peers'>
                    <Button variant="dark" size='lg'>Show Peers</Button>
                </div>
            </div>
        );
    }


}

export default TopMap;
