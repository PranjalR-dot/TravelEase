import "./Login.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FaEnvelope,
    FaLock,
    FaSignInAlt
} from "react-icons/fa";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {

        window.scrollTo(0, 0);

        const rememberedEmail =
            localStorage.getItem("rememberedEmail");

        if (rememberedEmail) {
            setFormData({
                email: rememberedEmail,
                password: "",
            });

            setRememberMe(true);
        }

    }, []);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:5000/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (data.success) {

                alert(data.message);

                // Save logged-in user, including account ID
                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(data.user)
                );

                // Save authentication token
                localStorage.setItem(
                    "authToken",
                    data.token
                );

                // Visitor tracking is handled by App.js

                // Remember email
                if (rememberMe) {

                    localStorage.setItem(
                        "rememberedEmail",
                        formData.email
                    );

                } else {

                    localStorage.removeItem("rememberedEmail");

                }

                // Clear form
                setFormData({
                    email: "",
                    password: "",
                });

                // Go to Home
                navigate("/");

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error("Login error:", error);

            alert("Unable to connect to the server");

        }

    };

    return (

        <div className="login-page">

            {/* Banner */}
            <section className="login-banner">

                <img
                    src="/images/Login_Banner.png"
                    alt="Login Banner"
                />

                <div className="banner-text">

                    <h1>Welcome Back!!</h1>

                    <p>
                        Sign in to your TravelEase account and continue planning
                        unforgettable journeys around the world.
                    </p>

                </div>

            </section>

            {/* Login Form */}
            <section className="login-container">

                <div className="login-form">

                    <h2>Login to your account</h2>

                    <p className="login-subtitle">
                        Enter your credentials to continue.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="input-box">

                            <FaEnvelope className="input-icon" />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="input-box">

                            <FaLock className="input-icon" />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="login-options">

                            <label>

                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                />

                                Remember Me

                            </label>

                            <Link
                                to="/"
                                className="forgot-password"
                            >
                                Forgot Password ?
                            </Link>

                        </div>

                        <button type="submit">
                            <FaSignInAlt />
                            Login
                        </button>

                    </form>

                    <div className="register-link">

                        <p>
                            Don't have an account ?
                            <Link to="/register">
                                Register
                            </Link>
                        </p>

                    </div>

                </div>

            </section>

        </div>

    );

}

export default Login;