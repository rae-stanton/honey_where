import { Navigate } from "react-router-dom";

function PrivateRouteWrapper({ isLoggedIn, children }) {
    return isLoggedIn ? children : <Navigate to="/login" />;
}

export default PrivateRouteWrapper;
