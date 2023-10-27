import React from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./AppNavbar.css";

function AppNavbar({isLoggedIn, userName}) {
  console.log(isLoggedIn)
  return (
    <Navbar className="main-navbar" expand="lg">
      <Container className="d-flex justify-content-between">
        {/* You can uncomment and add back the logo or any other navbar components here if needed */}
        {isLoggedIn && <span>Welcome, {userName}!</span>}
        <Nav className="flex-grow-1 justify-content-end align-items-center">
          <Nav.Link as={Link} to="/" className="navlink">Home</Nav.Link>
          {
            isLoggedIn ? (
              <Nav.Link as={Link} to="/logout" className="navlink">Logout</Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/signup" className="navlink">Sign Up</Nav.Link>
                <Nav.Link as={Link} to="/login" className="navlink">Log In</Nav.Link>
              </>
            )
          }
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
