import "./Contact.css";
import React, { useEffect, useState } from "react";

import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaInstagram,
    FaFacebookF,
    FaYoutube,
    FaPaperPlane,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

function Contact() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [status, setStatus] = useState("");
    const [statusType, setStatusType] = useState("");
    const [sending, setSending] = useState(false);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setSending(true);
        setStatus("");
        setStatusType("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/contact",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to send your message."
                );
            }

            setStatus(data.message);
            setStatusType("success");

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
        } catch (error) {
            console.error("Contact form error:", error);

            setStatus(
                error.message === "Failed to fetch"
                    ? "Unable to connect to the server. Please try again."
                    : error.message
            );
            setStatusType("error");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="contact-page">

            {/* Banner */}
            <section className="contact-banner">
                <img
                    src="/images/Contact_Banner.png"
                    alt="Contact Banner"
                />

                <div className="banner-text">
                    <h1>Contact Us</h1>

                    <p>
                        We'd love to hear from you. Whether you have questions,
                        suggestions or need help planning your next journey,
                        our TravelEase team is always ready to assist.
                    </p>
                </div>
            </section>

            {/* Heading */}
            <section className="contact-heading">
                <h2>Get in Touch</h2>

                <p>
                    We're here to help you plan your perfect trip.
                    Reach out anytime!
                </p>
            </section>

            {/* Contact Cards */}
            <section className="contact-cards">
                <div className="card">
                    <FaMapMarkerAlt className="icon" />
                    <h3>Address</h3>

                    <p>
                        TravelEase <br />
                        Surat, Gujarat <br />
                        India
                    </p>
                </div>

                <div className="card">
                    <FaPhoneAlt className="icon" />
                    <h3>Phone</h3>

                    <p>
                        +91 9876543210 <br />
                        Mon - Sat <br />
                        9:00 AM - 7:00 PM
                    </p>
                </div>

                <div className="card">
                    <FaEnvelope className="icon" />
                    <h3>Email</h3>

                    <p>
                        support@travelease.com <br />
                        info@travelease.com
                    </p>
                </div>
            </section>

            {/* Form + Image */}
            <section className="contact-container">
                <div className="contact-form">
                    <h2>Send Us A Message</h2>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength="100"
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            maxLength="254"
                            required
                        />

                        <input
                            type="text"
                            name="subject"
                            placeholder="Subject"
                            value={formData.subject}
                            onChange={handleChange}
                            maxLength="200"
                            required
                        />

                        <textarea
                            name="message"
                            rows="6"
                            placeholder="Your Message"
                            value={formData.message}
                            onChange={handleChange}
                            maxLength="5000"
                            required
                        />

                        {status && (
                            <p
                                role="status"
                                className={`contact-status ${statusType}`}
                            >
                                {status}
                            </p>
                        )}

                        <button type="submit" disabled={sending}>
                            <FaPaperPlane />
                            {sending ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>

                <div className="contact-image">
                    <img
                        src="/images/Contact_Image.png"
                        alt="Travel Contact"
                    />
                </div>
            </section>

            {/* Social */}
            <section className="social-section">
                <h2>Follow Us</h2>

                <div className="social-icons">
                    <a href="/" aria-label="Instagram">
                        <FaInstagram />
                    </a>

                    <a href="/" aria-label="Facebook">
                        <FaFacebookF />
                    </a>

                    <a href="/" aria-label="X">
                        <FaXTwitter />
                    </a>

                    <a href="/" aria-label="YouTube">
                        <FaYoutube />
                    </a>
                </div>
            </section>
        </div>
    );
}

export default Contact;
