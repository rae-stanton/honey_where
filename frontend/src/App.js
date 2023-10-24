import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios"
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./Home"
import AppNavbar from './AppNavbar';

function App() {
  return (
    <Router>
      <div>
        {/* NavBar import */}
        <AppNavbar />

        {/*Routes here */}
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
