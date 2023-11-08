import React, { useState, useEffect } from "react";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";

function UserEditForm({ userId, updateUserName }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [initialValues, setInitialValues] = useState({ name: "", email: "" });

  useEffect(() => {
    // Fetch the user data when the component mounts
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Assuming you use Bearer token
            },
          }
        );

        if (response.status === 200) {
          setInitialValues({
            name: response.data.name,
            email: response.data.email, // Assuming the response has an email field
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
    <div className="edit-form">
      <div className="edit-content">
        <h1>Edit User:</h1>
        <Formik
          initialValues={initialValues}
          enableReinitialize // This will reset the form when initialValues change
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const response = await axios.patch(
                `http://127.0.0.1:5000/users/${userId}`,
                values, // Sending the form values directly
                {
                  headers: {
                    Authorization: `Bearer ${token}`, // Assuming you use Bearer token
                  },
                }
              );

              if (response.status === 200) {
                alert("User updated successfully!");
                updateUserName(values.name);
                navigate("/dashboard"); // Or wherever you need to redirect after update
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
            <Card className="mt-5 w-80 forms">
              <Form className="form-border">
                <br />

                <label htmlFor="name">Name</label>
                <br />
                <Field id="name" name="name" placeholder="John Doe" />
                <br />

                <label htmlFor="email">Email</label>
                <br />
                <Field
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  type="email"
                />
                <br />

                <Button
                  variant="primary"
                  type="submit"
                  className="login-button"
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
                              Authorization: `Bearer ${token}`, // Assuming you use Bearer token
                            },
                          }
                        );

                        if (response.status === 200) {
                          alert("User deleted successfully!");
                          localStorage.clear(); // Clear local storage
                          navigate("/"); // Navigate to home or login page
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
              </Form>
            </Card>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default UserEditForm;
