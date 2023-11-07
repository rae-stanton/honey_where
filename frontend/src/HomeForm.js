import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import DismissibleSuccessAlert from './SuccessAlert';
import { Card, Button } from "react-bootstrap";
import "./Home.css"

function AddHome() {
    const token = localStorage.getItem('access_token');
    const [showAlert, setShowAlert] = useState(false);


    const validate = values => {
        const errors = {};

        if (!values.homeName) {
            errors.homeName = 'Home name cannot be blank';
        }

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            homeName: '',
        },
        validate,
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const response = await axios.post('http://127.0.0.1:5000/assign_home', { name: values.homeName }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setStatus(response.data.message);
                setShowAlert(true);
            } catch (error) {
                setStatus('An error occurred while adding your home.');
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="d-flex justify-content-center align-items-center vh-85">
            <Card className="mt-5 w-80 forms">
                <Card.Body>
                    <h4 className="header-text text-center text-primary mb-4">Add Your Hive</h4>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="homeName" className="form-label">Hive Name</label>
                            <input
                                id="homeName"
                                name="homeName"
                                type="text"
                                placeholder="Enter Hive Name"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.homeName}
                                className="form-control"
                            />
                            {formik.touched.homeName && formik.errors.homeName ? (
                                <div className="text-danger mt-2">{formik.errors.homeName}</div>
                            ) : null}
                        </div>

                        <Button type="submit" className="w-100 mb-3 btn-primary login-button" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Adding...' : 'Add Home'}
                        </Button>
                        {formik.status && <p className="text-center p-text-login">{formik.status}</p>}
                    </form>
                    {showAlert && <DismissibleSuccessAlert />}
                </Card.Body>
            </Card>
        </div>
    );
}

export default AddHome;
