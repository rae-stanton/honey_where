import React, { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import DismissibleSuccessAlert from "./SuccessAlert";
import { Card, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function AddItem() {
  const token = localStorage.getItem("access_token");
  const [showAlert, setShowAlert] = useState(false);
  const [itemAdded, setItemAdded] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [subrooms, setSubrooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomsAndSubrooms = async () => {
      try {
        const roomsResponse = await axios.get("http://127.0.0.1:5000/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(roomsResponse.data.rooms || []);

        const subroomsResponse = await axios.get(
          "http://127.0.0.1:5000/subrooms",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSubrooms(subroomsResponse.data.subrooms || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchRoomsAndSubrooms();
  }, [token]);

  const formik = useFormik({
    initialValues: {
      itemName: "",
      itemType: "",
      roomId: null,
      subroomId: null,
    },
    validate: (values) => {
      const errors = {};
      if (!values.itemName) {
        errors.itemName = "Item name cannot be blank";
      }
      if (!values.itemType) {
        errors.itemType = "Please select an item type";
      }
      if (!values.roomId && !values.subroomId) {
        errors.roomOrSubroom = "Please select a room or a subroom";
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      const postData = {
        name: values.itemName,
        type: values.itemType,
        roomId: values.roomId,
        subroomId: values.subroomId,
      };
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/add_item",
          postData,
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
    navigate("/dashboard");
  };
  const handleRoomChange = (e) => {
    const value = e.target.value === "" ? "" : parseInt(e.target.value, 10);
    formik.setFieldValue("roomId", value);
    formik.setFieldValue("subroomId", "");
  };

  const handleSubroomChange = (e) => {
    const value = e.target.value === "" ? "" : parseInt(e.target.value, 10);
    formik.setFieldValue("subroomId", value);
    // The next part assumes that each subroom object has a roomId property
    const selectedSubroom = subrooms.find((subroom) => subroom.id === value);
    if (selectedSubroom) {
      formik.setFieldValue("roomId", selectedSubroom.roomId);
    } else {
      formik.setFieldValue("roomId", "");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-85">
      <Card className="mt-5 w-80 forms">
        <Card.Body>
          {showAlert && <DismissibleSuccessAlert message={formik.status} />}
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
                <Button variant="primary" onClick={handleAddMore}>
                  Yes, add more
                </Button>
                <Button variant="secondary" onClick={handleFinish}>
                  No, I'm done
                </Button>
              </div>
            </div>
          ) : (
            <Form onSubmit={formik.handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="itemName">Item Name</Form.Label>
                <Form.Control
                  id="itemName"
                  name="itemName"
                  type="text"
                  placeholder="Enter Item Name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.itemName}
                />
                {formik.touched.itemName && formik.errors.itemName && (
                  <div className="text-danger">{formik.errors.itemName}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="itemType">Item Type</Form.Label>
                <Form.Select
                  id="itemType"
                  name="itemType"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.itemType}
                >
                  {/* Item type options */}
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
                </Form.Select>
                {formik.touched.itemType && formik.errors.itemType && (
                  <div className="text-danger">{formik.errors.itemType}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="roomId">Room</Form.Label>
                <Form.Select
                  id="roomId"
                  name="roomId"
                  onChange={handleRoomChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.roomId}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </Form.Select>
                {formik.touched.roomId && formik.errors.roomId && (
                  <div className="text-danger">{formik.errors.roomId}</div>
                )}
              </Form.Group>

              {rooms.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="subroomId">
                    Subroom (optional)
                  </Form.Label>
                  <Form.Select
                    id="subroomId"
                    name="subroomId"
                    onChange={handleSubroomChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.subroomId}
                  >
                    <option value="">Select a subroom</option>
                    {subrooms
                      .filter((subroom) =>
                        subroom.rooms.some(
                          (room) => room.id === parseInt(formik.values.roomId)
                        )
                      )
                      .map((subroom) => (
                        <option key={subroom.id} value={subroom.id}>
                          {subroom.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-100 mb-3"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Adding..." : "Add Item"}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default AddItem;
