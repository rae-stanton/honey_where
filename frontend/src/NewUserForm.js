import React from "react";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import { Card, Button } from "react-bootstrap";
import "./NewUserForm.css";

function NewUserForm() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
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
          <Card className="mt-5 w-80">
            <Card.Body>
              <h4 className="header-text text-center text-primary mb-4">Sign Up:</h4>
              <Form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <Field id="name" name="name" placeholder="Luna Faust" className="form-control" />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <Field id="email" name="email" placeholder="example@example.com" type="email" className="form-control" />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <Field id="password" name="password" placeholder="Password" type="password" className="form-control" />
                </div>

                <Button type="submit" className="w-100 mb-3 login-button" disabled={isSubmitting}>
                  Sign me up!
                </Button>
              </Form>
            </Card.Body>
          </Card>
        )}
      </Formik>
    </div>
  );
}

export default NewUserForm;
