import React, { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import DismissibleSuccessAlert from "./SuccessAlert";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function AddItem() {
  const token = localStorage.getItem("access_token");
  const [showAlert, setShowAlert] = useState(false);
  const [itemAdded, setItemAdded] = useState(false);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRooms(response.data.rooms || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, [token]);

  const formik = useFormik({
    initialValues: {
      itemName: "",
      itemType: "",
      roomId: "", // Assuming you want to add item to a room immediately
    },
    validate: (values) => {
      const errors = {};

      if (!values.itemName) {
        errors.itemName = "Item name cannot be blank";
      }

      if (!values.itemType) {
        errors.itemType = "Please select an item type";
      }

      if (!values.roomId) {
        errors.roomId = "Please select a room";
      }

      return errors;
    },
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/add_item",
          {
            name: values.itemName,
            type: values.itemType,
            roomId: values.roomId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStatus(response.data.message);
        setShowAlert(true);
        setItemAdded(true);
      } catch (error) {
        setStatus("An error occurred while adding your item.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAddMore = () => {
    setItemAdded(false);
    formik.resetForm();
  };

  const handleFinish = () => {
    navigate("/");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-85">
      <Card className="mt-5 w-80 forms">
        <Card.Body>
          {showAlert && <DismissibleSuccessAlert />}
          <h4 className="header-text text-center text-primary mb-4">
            Add An Item
          </h4>

          {itemAdded ? (
            <div>
              <p>
                Your item was added successfully! Would you like to add another?
              </p>

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
                <label htmlFor="itemName" className="form-label">
                  Item Name
                </label>
                <input
                  id="itemName"
                  name="itemName"
                  type="text"
                  placeholder="Enter Item Name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.itemName}
                  className="form-control"
                />
                {formik.touched.itemName && formik.errors.itemName ? (
                  <div className="text-danger mt-2">
                    {formik.errors.itemName}
                  </div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="itemType" className="form-label">
                  Item Type
                </label>
                <select
                  id="itemType"
                  name="itemType"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.itemType}
                  className="form-control"
                >
                  {/* Here you would populate the options based on the ItemType enum */}
                  <option value="" label="Select item type" />
                  <option value="HOUSEHOLD" label="Household" />
                  <option value="DECORATION" label="Decoration" />
                  <option value="TOOL" label="Tool" />
                  <option value="UTENSIL" label="Utensil" />
                  <option value="APPLIANCE" label="Appliance" />
                  <option value="PHOTO" label="Photo" />
                  <option value="PERSONAL" label="Personal" />
                  <option value="ELECTRONIC" label="Electronic" />
                  <option value="CLOTHING" label="Clothing" />
                  <option value="PET" label="Pet" />
                  <option value="MISCELLANEOUS" label="Miscellaneous" />

                  {/* ... Add other types */}
                </select>
                {formik.touched.itemType && formik.errors.itemType ? (
                  <div className="text-danger mt-2">
                    {formik.errors.itemType}
                  </div>
                ) : null}
              </div>

              <div className="mb-3">
                <label htmlFor="roomId" className="form-label">
                  Room
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.roomId}
                  className="form-control"
                >
                  <option value="" label="Select a room" />
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id} label={room.name} />
                  ))}
                </select>
                {formik.touched.roomId && formik.errors.roomId ? (
                  <div className="text-danger mt-2">{formik.errors.roomId}</div>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-100 mb-3 btn-primary login-button"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Adding..." : "Add Item"}
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

export default AddItem;
