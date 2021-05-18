import { Component } from "react";
import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

export default class DashboardNavbar extends Component {
    render() {
        return (
            // <Navbar bg="light" expand="lg">
            //     <Navbar.Brand>Visualing Security Metrics</Navbar.Brand>
            //     <Navbar.Toggle aria-controls="basic-navbar-nav" />
            //     <Navbar.Collapse id="basic-navbar-nav">
            //         <Nav className="mr-auto">
            //             <div className='wrapper'>
            //                 <Nav.Link href="#home">Home</Nav.Link>
            //                 <Nav.Link href="#dashboard">Dashboard</Nav.Link>
            //                 <Nav.Link href="#link">About Us</Nav.Link>
            //             </div>
            //         </Nav>
            //     </Navbar.Collapse>
            // </Navbar>

            <div className='navbar'>
                <div className='name'>
                    <h1>Visualing Security Metrics</h1>
                </div>
                <div className='wrapper'>
                    {/* <div className="el">
                        <a>Home</a>
                    </div> */}
                    <div className="el">
                        <a>Dashboard</a>
                    </div>
                    <div className="el">
                        <a>About Us</a>
                    </div>
                </div>
            </div>
        )
    }
}