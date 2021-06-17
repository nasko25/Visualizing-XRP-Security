import React, { Component } from 'react';

type LoaderProps = {
    top: number
}

export default class Loader extends Component<LoaderProps> {
    render() {
        return (
        <div id="loader" style={{ position: "absolute", top: `${this.props.top}%` }} >
            <img width="10%"
                style={{
                    animation: `spin 3s linear infinite`,
                    marginLeft: "auto",
                    marginRight: "auto"
                }}
                alt=""
                src={"https://i.pinimg.com/originals/e6/9d/92/e69d92c8f36c37c84ecf8104e1fc386d.png"}
            ></img>
        </div>
        )
    }
}
