import React from "react";
import { Card, Container } from "react-bootstrap";
import "./Home.css";
import logo from "../src/images/navgraphic.png";

function Home({ userName }) {
  return (
    <Container className="my-4">
      <Card className="home-card">
        <Card.Body>
          <Card.Title>Welcome to the Home Page</Card.Title>
          <Card.Text>
            Hello {userName}!
            <br />
            What is HoneyWhere?
            <br />
            More text on what this is that fades in
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
