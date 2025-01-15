// src/pages/VerifyEmail.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import authService from '../appwrite/auth'; // Import your auth service

const VerifyEmail = () => {
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            verifyToken(token);
        }
    }, [location]);

    const verifyToken = async (token) => {
        try {
            // Fetch the user by token from the database
            const response = await fetch(`${conf.appwriteUrl}/databases/${conf.appwriteDatabaseId}/collections/${conf.appwriteUserCollectionId}/documents?filters=token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': conf.appwriteProjectId,
                    'X-Appwrite-Key': conf.adminApiKey,
                },
            });

            if (!response.ok) {
                throw new Error('Token verification failed');
            }

            const data = await response.json();
            if (data.documents.length > 0) {
                // Token is valid, verify the user in your database
                await verifyUser(data.documents[0].id); // Call to verify the user
                alert('Email verified successfully!');
            } else {
                alert('Invalid or expired verification token.');
            }
        } catch (error) {
            console.error(error);
            alert('Error verifying email: ' + error.message);
        }
    };

    const verifyUser = async (userId) => {
        // Implement logic to update the user's verified status in your database
        // You may need to create another endpoint for this action
        await fetch(`${conf.appwriteUrl}/databases/${conf.appwriteDatabaseId}/collections/${conf.appwriteUserCollectionId}/documents/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': conf.appwriteProjectId,
                'X-Appwrite-Key': conf.adminApiKey,
            },
            body: JSON.stringify({
                verified: true // Add a field for verification
            }),
        });
    };

    return <div>Verifying your email...</div>;
};

export default VerifyEmail;
