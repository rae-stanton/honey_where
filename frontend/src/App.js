import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios"
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./Home"
import AppNavbar from './AppNavbar';
import Signup from "./Signup";
import Login from "./Login"
import Logout from "./Logout"

function App() {
  return (
    <Router>
      <div>
        {/* NavBar import */}
        <AppNavbar />

        {/*Routes here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
