import React from "react";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import Button from "react-bootstrap/Button";

function UserEditForm({ userId }) {
  return (
    <div className="edit-form">
      <div className="edit-content">
        <h1>Edit User:</h1>
        <Formik
          initialValues={{
            name: "", // Need to add state in order to control user's name being populated here once I add login.
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const response = await axios.patch(`http://127.0.0.1:5000/users/${userId}`, {
                name: values.name,
              });

              if (response.status === 200) {
                alert("User updated successfully!");
              } else {
                alert(response.data.message || "User update failed.");
              }
            } catch (error) {
              alert(error.response.data.message || "User update failed.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-border">
              <br />

              <label htmlFor="name">Name</label>
              <br />
              <Field id="name" name="name" placeholder="Luna Lucy" />
              <br />

              <br />
              <Button variant="primary" type="submit" className="form-button" disabled={isSubmitting}>
                Edit User
              </Button>
              <br />
              <Button variant="danger" onClick={async () => {
                try {
                  const response = await axios.delete(`http://127.0.0.1:5000/users/${userId}`);

                  if (response.status === 200) {
                    alert("User deleted successfully!");
                  } else {
                    alert(response.data.message || "User deletion failed.");
                  }
                } catch (error) {
                  alert(error.response.data.message || "User deletion failed.");
                }
              }}>
                Delete User
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default UserEditForm;
