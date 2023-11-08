import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Home";
import AppNavbar from "./AppNavbar";
import Signup from "./Signup";
import Login from "./Login";
import Logout from "./Logout";
import AddHome from "./HomeForm";
import AddRoom from "./AddRoom";
import AddItem from "./AddItem";
import UserDash from "./UserDash";
import UserEditForm from "./UserEditForm";
import PrivateRouteWrapper from "./PrivateRouteWrapper";
import honeyImage from "../src/images/honeydrip.png";
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { DragDropProvider } from "./DragDropContext";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token"))
  );
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    if (storedUserName) {
      setUserName(storedUserName);
    }

    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    setIsLoggedIn(Boolean(localStorage.getItem("access_token")));
  }, []);
  function updateUserName(newName) {
    setUserName(newName);
    localStorage.setItem("user_name", newName);
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropProvider>
        <Router>
          <div
            className="app-background"
            style={{ backgroundImage: `url(${honeyImage})` }}
          >
            {/* NavBar import */}
            <AppNavbar
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              userName={userName}
            />

            {/* Routes here */}
            <Routes>
              <Route path="/" element={<Home userName={userName} />} />
              <Route path="signup" element={<Signup />} />
              <Route
                path="login"
                element={
                  <Login
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    userName={userName}
                    setUserName={setUserName}
                    userId={userId}
                    setUserId={setUserId}
                  />
                }
              />
              <Route
                path="logout"
                element={
                  <Logout
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    setUserName={setUserName}
                  />
                }
              />
              <Route
                path="add-home"
                element={
                  <PrivateRouteWrapper isLoggedIn={isLoggedIn}>
                    <AddHome />
                  </PrivateRouteWrapper>
                }
              />
              <Route
                path="add-room"
                element={
                  <PrivateRouteWrapper isLoggedIn={isLoggedIn}>
                    <AddRoom />
                  </PrivateRouteWrapper>
                }
              />
              <Route
                path="add-item"
                element={
                  <PrivateRouteWrapper isLoggedIn={isLoggedIn}>
                    <AddItem />
                  </PrivateRouteWrapper>
                }
              />
              <Route
                path="dashboard"
                element={
                  <PrivateRouteWrapper isLoggedIn={isLoggedIn}>
                    <UserDash userName={userName} />
                  </PrivateRouteWrapper>
                }
              />
              <Route
                path="edit-user"
                element={
                  <PrivateRouteWrapper isLoggedIn={isLoggedIn}>
                    <UserEditForm userName={userName} userId={userId} updateUserName={updateUserName} />
                  </PrivateRouteWrapper>
                }
              />
            </Routes>
          </div>
        </Router>
      </DragDropProvider>
    </DndProvider>
  );
}

export default App;
