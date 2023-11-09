import React from "react";
import { Card, Container } from "react-bootstrap";
import "./Home.css";
import logo from "../src/images/navgraphic.png";

function Home({ userName }) {
  return (
    <Container className="my-4">
      <Card className="home-card">
        <Card.Body>
          <Card.Title className="home-card card-title">
            Welcome to HoneyWhere!
          </Card.Title>
          <Card.Text className="home-card-text">
            {userName ? `Hello, ${userName}! 👋 ` : "Welcome!"}
            <br />
            <br />
            <span className="home-middle-text">What is HoneyWhere?</span>
            <br />
            <br />
            <span>HoneyWhere is inventory management for your home.</span>
            <br />
            <br />
            <span className="home-middle-text">
              Have you ever asked your "honey" where something is and they just
              don't know?
            </span>
            <br />
            <br />
            <span>That's where HoneyWhere comes in!</span>
            <br />
          </Card.Text>
          {/* Other content */}
          <div className="custom-image-container">
            <img src={logo} alt="Custom" className="bottom-right-image" />
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Home;
