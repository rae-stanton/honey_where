import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import DismissibleSuccessAlert from "./SuccessAlert";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function AddRoom() {
  const token = localStorage.getItem("access_token");
  const [showAlert, setShowAlert] = useState(false);
  const [roomAdded, setRoomAdded] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      roomName: "",
      roomType: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.roomName) {
        errors.roomName = "Room name cannot be blank";
      }

      if (!values.roomType) {
        errors.roomType = "Please select a room type";
      }

      return errors;
    },
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/assign_room",
          { name: values.roomName, type: values.roomType },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStatus(response.data.message);
        setShowAlert(true);
        setRoomAdded(true);
      } catch (error) {
        setStatus("An error occurred while adding your room.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAddMore = () => {
    setRoomAdded(false);
    formik.resetForm();
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-85">
      <Card className="mt-5 w-80 forms">
        <Card.Body>
          {showAlert && <DismissibleSuccessAlert />}
          <h4 className="header-text text-center text-primary mb-4">
            Add a Comb
          </h4>

          {roomAdded ? (
            <div>
              <p>Your comb was added successfully! Would you like to add another?</p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <Button className="login-button" onClick={handleAddMore}>
                  Yes, add more
                </Button>
                <Button className="login-button" onClick={handleFinish}>
                  No, I'm done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-3">
                <label htmlFor="roomName" className="form-label">
                  Comb Name
                </label>
                <input
                  id="roomName"
                  name="roomName"
                  type="text"
                  placeholder="Enter Comb Name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.roomName}
                  className="form-control"
                />
                {formik.touched.roomName && formik.errors.roomName ? (
                  <div className="text-danger mt-2">
                    {formik.errors.roomName}
                  </div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="roomType" className="form-label">
                  Comb Type
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.roomType}
                  className="form-control"
                >
                  <option value="" label="Select comb type" />
                  <option value="BEDROOM" label="Bedroom" />
                  <option value="LIVING_ROOM" label="Living Room" />
                  <option value="KITCHEN" label="Kitchen" />
                  <option value="BATHROOM" label="Bathroom" />
                  <option value="GARAGE" label="Garage" />
                </select>
                {formik.touched.roomType && formik.errors.roomType ? (
                  <div className="text-danger mt-2">
                    {formik.errors.roomType}
                  </div>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-100 mb-3 btn-primary login-button"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Adding..." : "Add Comb"}
              </Button>
              {formik.status && (
                <p className="text-center p-text-login">{formik.status}</p>
              )}
            </form>
          )}


        </Card.Body>
      </Card>
    </div>
  );
}

export default AddRoom;
