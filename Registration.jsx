import "./Registration.css";
import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaUserPlus,
} from "react-icons/fa";

function Register() {

  useEffect(() => {
    window.scrollTo(0,0);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);

        setFormData({
          name: "",
          email: "",
          mobile: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error("Registration error : ",error);
      alert("Unable to connect to the server..");
    }
    
  };

  return (
    <div className="register-page">

        {/* Banner */}

        <section className="register-banner">

          <img src="/images/Register_Banner.png" alt="Register Banner" />

        </section>

        {/* Register Form */}

        <section className="register-container">

          <div className="register-form">

            <h2>Create Account</h2>

            <p className="register-subtitle">
              Fill in your details to get started.
            </p>

          <form onSubmit={handleSubmit}>

            <div className="input-box">
              <FaUser className="input-icon" />
              <input type="text" name="name" placeholder="Full Name"  value={formData.name} onChange={handleChange} required />
            </div>

            <div className="input-box">
              <FaEnvelope className="input-icon" />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="input-box">
              <FaPhoneAlt className="input-icon" />
              <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />
            </div>

            <div className="input-box">
              <FaLock className="input-icon" />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="input-box">
              <FaLock className="input-icon" />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <div className="terms">

              <label>
                <input type="checkbox" required />
                I agree to the 
                <span>Terms & Conditions</span>
              </label>

            </div>

            <button type="submit">
              <FaUserPlus />
              Create Account
            </button>

          </form>

          <div className="login-link">

            <p>
              
              Already have an account ?

              <Link to="/login">
                Login
              </Link>

            </p>

          </div>

          </div>

        </section>

    </div>
  );
}

export default Register;