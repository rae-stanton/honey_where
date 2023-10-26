import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./AppNavbar.css";
// import logoImage from '../src/images/honeywherelogonav.png';

function AppNavbar() {
  return (
    <Navbar className="main-navbar" expand="lg">
      <Container className="d-flex justify-content-between">
        {/* <Navbar.Brand>
          <img
            src={logoImage}
            className="d-inline-block align-top"
            alt="Your Logo"
          />
        </Navbar.Brand> */}
        <Nav className="flex-grow-1 justify-content-end align-items-center">
          <Nav.Link
            as={Link}
            to="/"
            style={{ marginRight: "10px" }}
            className="navlink"
          >
            Home
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/signup"
            style={{ marginRight: "10px" }}
            className="navlink"
          >
            Sign Up
          </Nav.Link>
          {loggedIn ? (
            <Nav.Link
              onClick={openModal}
              style={{ marginRight: "10px" }}
              className="navlink"
            >
              Log Out
            </Nav.Link>
          ) : (
            <>
              <Nav.Link
                as={Link}
                to="/signup"
                style={{ marginRight: "10px" }}
                className="navlink"
              >
                Sign Up
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/login"
                style={{ marginRight: "10px" }}
                className="navlink"
              >
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
