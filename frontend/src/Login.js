import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form } from "formik";

function Login() {
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
