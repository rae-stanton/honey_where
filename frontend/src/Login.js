import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import { Card, Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Nav from "react-bootstrap/Nav";
import "./LoginStyling.css"
import "bootstrap/dist/css/bootstrap.min.css"; // Don't forget to import Bootstrap CSS

function Login({ setIsLoggedIn, setUserName }) {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center vh-85">
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
              localStorage.setItem("user_name", response.data.user_name);
              setIsLoggedIn(true);
              setUserName(response.data.user_name);
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
          <Card className="mt-5 w-80 forms">
            <Card.Body>
              <h4 className="header-text text-center text-primary mb-4">Login</h4>
              <Form>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <Field
                    as="input"
                    id="email"
                    name="email"
                    placeholder="Your email"
                    type="email"
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <Field
                    as="input"
                    id="password"
                    name="password"
                    placeholder="Your password"
                    type="password"
                    className="form-control"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-100 mb-3 login-button"
                  disabled={isSubmitting}
                >
                  Login
                </Button>
              </Form>
              <p className="text-center p-text-login">
                Don't have an account?
                <Nav.Link
                  as={Link}
                  to="/signup"
                  className="text-primary ms-2 d-inline-block"
                >
                  Sign Up
                </Nav.Link>
              </p>
            </Card.Body>
          </Card>
        )}
      </Formik>
    </div>
  );
}

export default Login;
