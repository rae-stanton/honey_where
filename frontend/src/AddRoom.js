import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import DismissibleSuccessAlert from './SuccessAlert';
import { Card, Button } from "react-bootstrap";

function AddRoom() {
    const token = localStorage.getItem('access_token');
    const [showAlert, setShowAlert] = useState(false);

    const formik = useFormik({
        initialValues: {
            roomName: '',
            roomType: '',  // initialize room type
        },
        validate: values => {
            const errors = {};

            if (!values.roomName) {
                errors.roomName = 'Room name cannot be blank';
            }

            if (!values.roomType) {
                errors.roomType = 'Please select a room type';
            }

            return errors;
        },
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const response = await axios.post('http://127.0.0.1:5000/assign_room',
                { name: values.roomName, type: values.roomType }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setStatus(response.data.message);
                setShowAlert(true);
            } catch (error) {
                setStatus('An error occurred while adding your room.');
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="d-flex justify-content-center align-items-center vh-85">
            <Card className="mt-5 w-80 forms">
                <Card.Body>
                    <h4 className="header-text text-center text-primary mb-4">Add A Room</h4>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="roomName" className="form-label">Room Name</label>
                            <input
                                id="roomName"
                                name="roomName"
                                type="text"
                                placeholder="Enter Room Name"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.roomName}
                                className="form-control"
                            />
                            {formik.touched.roomName && formik.errors.roomName ? (
                                <div className="text-danger mt-2">{formik.errors.roomName}</div>
                            ) : null}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="roomType" className="form-label">Room Type</label>
                            <select
                                id="roomType"
                                name="roomType"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.roomType}
                                className="form-control"
                            >
                                <option value="" label="Select room type" />
                                <option value="BEDROOM" label="Bedroom" />
                                <option value="LIVING_ROOM" label="Living Room" />
                                <option value="KITCHEN" label="Kitchen" />
                                <option value="BATHROOM" label="Bathroom" />
                                <option value="GARAGE" label="Garage" />
                                <option value="ATTIC" label="Attic" />
                            </select>
                            {formik.touched.roomType && formik.errors.roomType ? (
                                <div className="text-danger mt-2">{formik.errors.roomType}</div>
                            ) : null}
                        </div>

                        <Button type="submit" className="w-100 mb-3 btn-primary login-button" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Adding...' : 'Add Room'}
                        </Button>
                        {formik.status && <p className="text-center p-text-login">{formik.status}</p>}
                    </form>
                    {showAlert && <DismissibleSuccessAlert />}
                </Card.Body>
            </Card>
        </div>
    );
}

export default AddRoom;
//     BEDROOM = "BEDROOM"
//     BATHROOM = "BATHROOM"
//     GARAGE = "GARAGE"
//     KITCHEN = "KITCHEN"
//     LIVING_ROOM = "LIVING_ROOM"
//     ATTIC = "ATTIC"
