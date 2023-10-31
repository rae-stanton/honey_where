import React, { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import DismissibleSuccessAlert from './SuccessAlert';

function AddHome() {
    const token = localStorage.getItem('access_token');
    const [showAlert, setShowAlert] = useState(false);

    const formik = useFormik({
        initialValues: {
            homeName: '',
        },
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
        <div>
            <h2>Add Your Home</h2>
            <form onSubmit={formik.handleSubmit}>
                <input
                    name="homeName"
                    type="text"
                    placeholder="Enter Home Name"
                    onChange={formik.handleChange}
                    value={formik.values.homeName}
                />
                <button type="submit" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Adding...' : 'Add Home'}
                </button>
                {formik.status && <p>{formik.status}</p>}
            </form>
            {showAlert && <DismissibleSuccessAlert />}
        </div>
    );
}

export default AddHome;
