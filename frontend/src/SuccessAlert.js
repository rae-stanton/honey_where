import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function DismissibleSuccessAlert() {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <Alert variant="success" onClose={() => setShow(false)} dismissible>
      <Alert.Heading>Added successfully!</Alert.Heading>
      <p>
        To view your home, <span style={{color: 'blue', cursor: 'pointer'}} onClick={() => navigate("/dashboard")}>click here</span>.
      </p>
    </Alert>
  );
}

export default DismissibleSuccessAlert;
