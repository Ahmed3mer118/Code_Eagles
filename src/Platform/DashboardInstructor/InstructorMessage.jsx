import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams, Outlet } from "react-router-dom";

import axios from "axios";
import { toast } from "react-hot-toast";
import InstructorService from '../classes/InstructorService';
import { DataContext } from '../Users/Context/Context';
import { Helmet } from 'react-helmet-async';

function InstructorMessage() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { URLAPI, getTokenInstructor } = useContext(DataContext)
    const [messages, setMessages] = useState([]);
    const [formData, setFormData] = useState({
        group_id: groupId,
        message: "",
        title: "",
        type: "",
        status: "",
    });

    const instructorService = new InstructorService(URLAPI, getTokenInstructor);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const messagesData = await InstructorService.getMessages(groupId);
                setMessages(messagesData.messages);
            } catch (error) {
                console.error("Error fetching messages:", error);
                toast.error("Failed to fetch messages");
            }
        };
        fetchMessages();
    }, [groupId]);

    const handleChangeMessage = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await instructorService.addMessage(groupId, formData);
            setFormData({
                group_id: groupId,
                message: "",
                title: "",
                type: "",
                status: "",
            });
            toast.success("Message sent successfully");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        }
    };

    return (
        <div className="container-fluid py-4">
            <Helmet>
                <title>Messages Management</title>
            </Helmet>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Messages Management</h2>
                    </div>
                </div>
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Messages</h5>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default InstructorMessage;

