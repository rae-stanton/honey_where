import React from 'react';
import { Card, Container } from 'react-bootstrap';
import './Home.css'; // Import your custom styles
import logo from "../src/images/honeywherelogonav.png"; // Make sure this path is correct

function Home({ userName }) {
  return (
    <Container className="my-4">
      <Card className="home-card">
        <Card.Body>
          <Card.Title>Welcome to the Home Page</Card.Title>
          <Card.Text>
            Hello, {userName}! Here is your main content.
          </Card.Text>
          {/* Other content */}
        </Card.Body>
        <div className="custom-image-container">
          <img src={logo} alt="Custom" className="bottom-right-image" />
        </div>
      </Card>
    </Container>
  );
}

export default Home;
