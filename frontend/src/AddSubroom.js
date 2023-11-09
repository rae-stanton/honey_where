import React, { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { Card, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function AddSubroom() {
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Fetch rooms on component mount
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

  // Formik for adding a subroom
  const formikSubroom = useFormik({
    initialValues: {
      subroomName: '',
      roomId: '',
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/subrooms",
          {
            name: values.subroomName,
            room_id: values.roomId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          alert('Subroom added successfully');
          resetForm({});
        }
      } catch (error) {
        console.error("Error adding subroom:", error);
        alert('Error adding subroom');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="d-flex justify-content-center align-items-center vh-85">
      <Card className="mt-5 w-80 forms">
        <Card.Body>
          <h4 className="header-text text-center text-primary mb-4">
            Add a Mini-Comb
          </h4>
          <Form onSubmit={formikSubroom.handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Mini-Comb Name</Form.Label>
              <br />
              <Form.Label className="sub-label">Things like totes, closet, whatever!</Form.Label>
              <Form.Control
                id="subroomName"
                name="subroomName"
                type="text"
                placeholder="Enter Mini-Comb Name"
                onChange={formikSubroom.handleChange}
                value={formikSubroom.values.subroomName}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comb (room):</Form.Label>
              <Form.Select
                id="roomId"
                name="roomId"
                onChange={formikSubroom.handleChange}
                value={formikSubroom.values.roomId}
              >
                <option value="">Select your comb:</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="login-button" disabled={formikSubroom.isSubmitting}>
              Add Mini-Comb
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AddSubroom;
