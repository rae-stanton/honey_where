import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Home";
import AppNavbar from "./AppNavbar";
import Signup from "./Signup";
import Login from "./Login";
import Logout from "./Logout";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token"))
  );
  const [userName, setUserName] = useState("");

  return (
    <Router>
      <div>
        {/* NavBar import */}
        <AppNavbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userName={userName}/>

        {/* Routes here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="signup" element={<Signup />} />
          <Route
            path="login"
            element={
              <Login
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                userName={userName}
                setUserName={setUserName}
              />
            }
          />
          <Route
            path="logout"
            element={
              <Logout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
