import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';

function DismissibleSuccessAlert() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <Alert variant="success" onClose={() => setShow(false)} dismissible>
      <Alert.Heading>Your home has been added successfully!</Alert.Heading>
      <p>
        To view your home, click here
      </p>
    </Alert>
  );
}

export default DismissibleSuccessAlert;
