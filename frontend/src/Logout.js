import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Logout({ setIsLoggedIn, setUserName }) {
  const navigate = useNavigate();
  const [error, setError] = useState(""); // State to store error message

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await axios.post(
          "http://127.0.0.1:5000/logout",
          {},
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("access_token"),
            },
          }
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsLoggedIn(false);
        setUserName('');
        localStorage.removeItem("user_name")
        navigate("/"); // Redirect to home
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError("Your session has expired. Please log in again."); // Set error state
        } else {
          console.error("Logout error", error);
        }
      }
    };

    handleLogout();
  }, [navigate]);

  if (error) {
    return <p>{error}</p>;
  }

  return null;
}

export default Logout;
