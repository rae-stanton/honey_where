import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import { useState } from 'react';

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const response = await axios.post("http://127.0.0.1:5000/login", {
              email: values.email,
              password: values.password,
            });

            if (response.status === 200) {
              localStorage.setItem("access_token", response.data.access_token);
              localStorage.setItem(
                "refresh_token",
                response.data.refresh_token
              );
              setIsLoggedIn(true);
              navigate("/"); // Redirect to home
            } else {
              alert("Login failed");
            }
          } catch (error) {
            console.error("Login error", error);
            alert("Login error");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="email">Email</label>
            <Field
              id="email"
              name="email"
              placeholder="Your email"
              type="email"
            />

            <label htmlFor="password">Password</label>
            <Field
              id="password"
              name="password"
              placeholder="Your password"
              type="password"
            />

            <button type="submit" disabled={isSubmitting}>
              Login
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Login;
