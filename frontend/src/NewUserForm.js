import React from "react";
import axios from "axios"; // Import axios
import { Formik, Field, Form } from "formik";
import Button from "react-bootstrap/Button";

function NewUserForm() {
  return (
    <div className="register-form">
      <div className="register-content">
        <h1>Create New User:</h1>
        <Formik
          initialValues={{
            name: "",
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const response = await axios.post("http://127.0.0.1:5000/users", {
                name: values.name,
              });

              // With axios, the response data is in the 'data' property
              if (response.status === 201) {
                alert("User created successfully!");
              } else {
                alert(response.data.message || "User creation failed.");
              }
            } catch (error) {
              // Handle errors gracefully
              alert(error.response.data.message || "User creation failed.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-border">
              {/* <img
                src={loginImage}
                alt="Login Illustration"
                className="login-image"
              /> */}
              <br />

              <label htmlFor="name">Name</label>
              <br />
              <Field id="name" name="name" placeholder="Luna Lucy" />
              <br />

              <br />
              <Button variant="primary" type="submit" className="form-button" disabled={isSubmitting}>
                Create User
              </Button>
              <br />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default NewUserForm;
