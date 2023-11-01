import React, { useState, useEffect } from "react";
import axios from "axios";
import Dropdown from "react-bootstrap/Dropdown";

function UserDash({ userName }) {
  const token = localStorage.getItem("access_token");
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");

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
  }, []);

  const filterItemsByName = (item) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const filterItemsByType = (item) => {
    if (selectedItemType && selectedItemType !== "") {
      return item.item_type === selectedItemType;
    }
    return true;
  };

  if (!userData) return <p>Loading user details...</p>;

  return (
    <div className="dashboard">
      <h2>Welcome back, {userName}</h2>

      <div className="filter-section">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <br />
        <Dropdown onSelect={(selectedKey) => setSelectedItemType(selectedKey)}>
          <Dropdown.Toggle
            variant="success"
            id="dropdown-basic"
            style={{ padding: "10px" }}
          >
            Filter by Type
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item eventKey="">None</Dropdown.Item>
            {Object.values(ItemType).map((type) => (
              <Dropdown.Item eventKey={type} key={type}>
                {type}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {userData.home && (
        <div className="home-details">
          <h3>Your Home: {userData.home.name}</h3>
          {userData.home.rooms && userData.home.rooms.length > 0 ? (
            <ul>
              <h3>Your rooms:</h3>
              {userData.home.rooms.map((room) => (
                <li key={room.id}>
                  {room.name} ({room.room_type})
                  {/* Display items of the room */}
                  <h5>Your items in this room:</h5>
                  {room.items &&
                    room.items
                      .filter(filterItemsByName)
                      .filter(filterItemsByType)
                      .map((item) => (
                        <ul>
                          <li key={item.id}>
                            {item.name} ({item.item_type})
                          </li>
                        </ul>
                      ))}
                  {/* Display subrooms of the room */}
                  {room.subrooms &&
                    room.subrooms.map((subroom) => (
                      <li key={subroom.id}>
                        {subroom.name}
                        {/* Display items of the subroom */}
                        {subroom.items &&
                          subroom.items
                            .filter(filterItemsByName)
                            .filter(filterItemsByType)
                            .map((item) => (
                              <ul>
                                <h4>Your items in subrooms:</h4>
                                <li key={item.id}>
                                  {item.name} ({item.item_type})
                                </li>
                              </ul>
                            ))}
                      </li>
                    ))}
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no rooms added yet.</p>
          )}
        </div>
      )}
    </div>
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
