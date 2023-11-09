import React, { useState } from "react";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import { Card, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./NewUserForm.css";

function validateForm(values) {
  const errors = {};
  if (!values.name) {
    errors.name = 'Name is required';
  } else if (values.name.length < 2) {
    errors.name = 'Name is too short';
  }

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

function NewUserForm() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });

  return (
    <div className="d-flex justify-content-center align-items-center vh-85">
      <Formik
        initialValues={{
          name: "",
          email: "",
          password: ""
        }}
        validate={validateForm}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const response = await axios.post("http://127.0.0.1:5000/users", values);
            if (response.status === 201) {
              setAlert({ show: true, message: 'User created successfully! Redirecting to sign in...', variant: 'success' });
              setTimeout(() => navigate("/login"), 3000);
            }
          } catch (error) {
            setAlert({ show: true, message: error.response?.data?.message || "User creation failed.", variant: 'danger' });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Card className="mt-5 w-80">
            <Card.Body>
              <h4 className="header-text text-center text-primary mb-4 forms">Sign Up:</h4>
              {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
              <Form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <Field id="name" name="name" placeholder="Luna Faust" className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`} />
                  {touched.name && errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <Field id="email" name="email" placeholder="example@example.com" type="email" className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`} />
                  {touched.email && errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <Field id="password" name="password" placeholder="Password" type="password" className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`} />
                  {touched.password && errors.password && <div className="invalid-feedback">{errors.password}</div>}
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
