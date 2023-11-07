import React, { useState, useEffect } from "react";
import axios from "axios";
import Dropdown from "react-bootstrap/Dropdown";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import "./UserDash.css";
import { Container, Row, Col } from "react-bootstrap";
import { DraggableItem } from "./DraggableItem"; // Assuming DraggableItem is in DraggableItem.js
import { DroppableArea } from "./DroppableArea";
import { useDragDropContext } from './DragDropContext';

function UserDash({ userName }) {
  const token = localStorage.getItem("access_token");
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const { onDrop, newRoom } = useDragDropContext();


  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("user_id");

      if (!userId) return;

      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/user_home_details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
        console.log(response.data);

      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [newRoom]);

  const filterItemsByName = (item) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const filterItemsByType = (item) => {
    if (selectedItemType && selectedItemType !== "") {
      return item.item_type === selectedItemType;
    }
    return true;
  };

  const itemTypeToDotColorMap = {
    HOUSEHOLD: "#FC6600",
    DECORATION: "#F9A602",
    TOOL: "#FDA50F",
    UTENSIL: "#CC7722",
    APPLIANCE: "#FFBF00",
    PHOTO: "#B1560F",
    PERSONAL: "#B3672B",
    ELECTRONIC: "	#FFBF00",
    CLOTHING: "#FC6600",
    PET: "#FDA50F",
    MISCELLANEOUS: "#F9A602",
  };

  const ColoredPill = ({ label }) => {
    const dotColor = itemTypeToDotColorMap[label] || "#ffffff";
    return (
      <Badge
        pill
        bg="secondary"
        className="item-badge"
        style={{ marginLeft: "5px" }}
      >
        <span
          style={{
            height: "10px",
            width: "10px",
            backgroundColor: dotColor,
            borderRadius: "50%",
            display: "inline-block",
            marginRight: "5px",
          }}
        ></span>
        {label}
      </Badge>
    );
  };
  const TypePill = ({ label }) => {
    return (
      <Badge pill bg="light" className="room-type">
        {label}
      </Badge>
    );
  };
  if (!userData) return <p>Loading user details...</p>;

  return (
    <Card className="dashboard-card">
      <Card.Body>
        <h2>Welcome back, {userName}</h2>

        <Container className="my-4">
          <Row className="justify-content-center">
            <Col md={6} className="d-flex flex-column align-items-center">
              <input
                type="text"
                placeholder="Where is my..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control mb-3"
              />
              <Dropdown
                onSelect={(selectedKey) => setSelectedItemType(selectedKey)}
              >
                <Dropdown.Toggle
                  variant="success"
                  id="dropdown-basic"
                  className="w-100"
                >
                  Filter by Type
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {" "}
                  {/* Same here for the dropdown menu */}
                  <Dropdown.Item eventKey="">None</Dropdown.Item>
                  {Object.values(ItemType).map((type) => (
                    <Dropdown.Item eventKey={type} key={type}>
                      {type}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Container>

        {userData.home && (
          <div className="home-details">
            <h3>Your Hive: {userData.home.name}</h3>
            <Container>
              <Row xs={1} md={3} className="g-4">
                {" "}
                {userData.home.rooms && userData.home.rooms.length > 0 ? (
                  userData.home.rooms.map((room) => (
                    <DroppableArea
                      key={room.id}
                      room={room}
                      onDrop={(item) => {
                        onDrop(item, room);
                      }}
                    >
                      <Col>
                        <Card className="mb-3">
                          <Card.Header as="h5" className="room-header">
                            {room.name} <TypePill label={room.room_type} />
                          </Card.Header>
                          <ListGroup variant="flush">
                            {room.items &&
                              room.items
                                .filter(filterItemsByName)
                                .filter(filterItemsByType)
                                .map((item) => (
                                  <DraggableItem
                                    key={item.id}
                                    item={item}
                                    currentRoomId={room.id}
                                  >
                                    <ListGroup.Item>
                                      {item.name}{" "}
                                      <ColoredPill label={item.item_type} />
                                    </ListGroup.Item>
                                  </DraggableItem>
                                ))}
                          </ListGroup>
                          {room.subrooms &&
                            room.subrooms.map((subroom) => (
                              <Card
                                key={subroom.id}
                                className="mb-2 mt-2 subroom-card"
                              >
                                <Card.Header as="h6" className="subroom-header">
                                  {subroom.name}
                                </Card.Header>
                                <ListGroup variant="flush">
                                  {subroom.items &&
                                    subroom.items
                                      .filter(filterItemsByName)
                                      .filter(filterItemsByType)
                                      .map((item) => (
                                        <ListGroup.Item key={item.id}>
                                          {item.name}{" "}
                                          <ColoredPill label={item.item_type} />
                                        </ListGroup.Item>
                                      ))}
                                </ListGroup>
                              </Card>
                            ))}
                        </Card>
                      </Col>
                    </DroppableArea>
                  ))
                ) : (
                  <p>You have no rooms added yet.</p>
                )}
              </Row>
            </Container>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

const ItemType = {
  HOUSEHOLD: "HOUSEHOLD",
  DECORATION: "DECORATION",
  TOOL: "TOOL",
  UTENSIL: "UTENSIL",
  APPLIANCE: "APPLIANCE",
  PHOTO: "PHOTO",
  PERSONAL: "PERSONAL",
  ELECTRONIC: "ELECTRONIC",
  CLOTHING: "CLOTHING",
  PET: "PET",
  MISCELLANEOUS: "MISCELLANEOUS",
};

export default UserDash;
