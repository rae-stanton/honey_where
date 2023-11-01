import React, { useState, useEffect } from "react";
import axios from "axios";

function UserDash({userName}) {
  const token = localStorage.getItem("access_token");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      // Fetch user id from local storage.
      const userId = localStorage.getItem("user_id");

      if (!userId) return; // If no user_id in local storage, don't make the request

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
              {userData.home.rooms.map((room) => (
                <li key={room.id}>
                  {room.name} ({room.room_type})
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
