import React, { useState, useEffect } from "react";
import axios from "axios";

function UserDash({userName}) {
  const token = localStorage.getItem("access_token");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      // Fetch user id from local storage.
      const userId = localStorage.getItem("user_id");

      if (!userId) return;
      // Note: the user's id is set on login, so this should just redirect if nil/Null
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/user_home_details`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
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

  if (!userData) return <p>Loading user details...</p>;

  return (
    <div className="dashboard">
      <h2>Welcome back, {userName}</h2>

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
                  {room.items && room.items.length > 0 && (
                    <ul>
                    <h5>Your items in the main room:</h5>
                      {room.items.map((item) => (
                        <li key={item.id}>
                          {item.name} ({item.item_type})
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Display subrooms of the room */}
                  {room.subrooms && room.subrooms.length > 0 && (
                    <ul>
                    <h4>Your subrooms:</h4>
                      {room.subrooms.map((subroom) => (
                        <li key={subroom.id}>
                          {subroom.name}
                          {/* Display items of the subroom */}
                          {subroom.items && subroom.items.length > 0 && (
                            <ul>
                            <h4>Your items in subrooms:</h4>
                              {subroom.items.map((item) => (
                                <li key={item.id}>
                                  {item.name} ({item.item_type})
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
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


export default UserDash;
