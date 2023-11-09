import React, { useState, useEffect } from "react";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import "./LoginStyling.css";

function UserEditForm({ userId, updateUserName }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [initialValues, setInitialValues] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setInitialValues({
            name: response.data.name,
            email: response.data.email,
          });
        }
      } catch (error) {
        console.error("Fetching user data failed", error);
        alert("Could not fetch user data.");
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-85">
      <Card className="mt-5 w-80 forms">
        <Card.Body>
          <h4 className="header-text text-center text-primary mb-4">
            Edit User
          </h4>
          <Formik
            initialValues={initialValues}
            enableReinitialize // This will reset the form when initialValues change
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const response = await axios.patch(
                  `http://127.0.0.1:5000/users/${userId}`,
                  values,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (response.status === 200) {
                  alert("User updated successfully!");
                  updateUserName(values.name);
                  navigate("/dashboard");
                } else {
                  alert(response.data.message || "User update failed.");
                }
              } catch (error) {
                alert(error.response?.data?.message || "User update failed.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <Field id="name" name="name" placeholder="John Doe" className="form-control" />
                </div>
                <br />

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <Field id="email" name="email" placeholder="john@example.com" type="email" className="form-control" />
                </div>
                <br />
              <div className="d-flex justify-content-between">
                <Button
                  variant="primary"
                  type="submit"
                  className="login-button me-2"
                  disabled={isSubmitting}
                >
                  Edit User
                </Button>
                <br />
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete your account? This action cannot be undone."
                      )
                    ) {
                      try {
                        const response = await axios.delete(
                          `http://127.0.0.1:5000/users/${userId}`,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );

                        if (response.status === 200) {
                          alert("User deleted successfully!");
                          localStorage.clear();
                          navigate("/");
                        } else {
                          alert(
                            response.data.message || "User deletion failed."
                          );
                        }
                      } catch (error) {
                        alert(
                          error.response?.data?.message ||
                            "User deletion failed."
                        );
                      }
                    }
                  }}
                >
                  Delete User
                </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
}

export default UserEditForm;
