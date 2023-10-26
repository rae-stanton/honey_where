import React from "react";
import axios from "axios";
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
            email: "",
            password: ""
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const response = await axios.post("http://127.0.0.1:5000/users", {
                name: values.name,
                email: values.email,
                password: values.password
              });
              if (response.status === 201) {
                alert("User created successfully!");
              } else {
                alert(response.data.message || "User creation failed.");
              }
            } catch (error) {
              alert(error.response.data.message || "User creation failed.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-border">
              <label htmlFor="name">Name</label>
              <br />
              <Field id="name" name="name" placeholder="Luna Faust" />
              <br />

              <label htmlFor="email">Email</label>
              <br />
              <Field id="email" name="email" placeholder="luna@example.com" type="email" />
              <br />

              <label htmlFor="password">Password</label>
              <br />
              <Field id="password" name="password" placeholder="Password" type="password" />
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
