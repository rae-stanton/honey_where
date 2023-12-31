import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "../src/images/navgraphic.png";
import "./AppNavbar.css";

function AppNavbar({ isLoggedIn }) {
  console.log(isLoggedIn);
  return (
    <Navbar className="main-navbar" expand="lg">
      <Container className="d-flex justify-content-between">
        <Navbar.Brand as={Link} to="/">
          <img
            src={logo}
            width="60"
            height="60"
            className="d-inline-block align-top"
            alt="Logo"
          />
          <span className="navbar-logo-text">HONEYWHERE</span>
        </Navbar.Brand>
        <Nav className="flex-grow-1 justify-content-end align-items-center">
          <Nav.Link as={Link} to="/" className="navlink">
            Home
          </Nav.Link>
          {isLoggedIn ? (
            <>
              <Nav.Link as={Link} to="/add-home" className="navlink">
                Add Hive
              </Nav.Link>
              <Nav.Link as={Link} to="/add-room" className="navlink">
                Add Combs
              </Nav.Link>
              <Nav.Link as={Link} to="/add-subroom" className="navlink">
                Add Mini-Comb
              </Nav.Link>
              <Nav.Link as={Link} to="/add-item" className="navlink">
                Add Items
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard" className="navlink">
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/logout" className="navlink">
                Logout
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/signup" className="navlink">
                Sign Up
              </Nav.Link>
              <Nav.Link as={Link} to="/login" className="navlink">
                Log In
              </Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
