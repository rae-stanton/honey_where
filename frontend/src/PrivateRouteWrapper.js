import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRouteWrapper({ isLoggedIn, children }) {
    return isLoggedIn ? children : <Navigate to="/login" state={{ fromPrivateRoute: true }} />;
}

export default PrivateRouteWrapper;
