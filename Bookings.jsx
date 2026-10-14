import "./Bookings.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { FaLock, FaTimes } from "react-icons/fa";

function Bookings() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser") || "null"
    );

    const isLoggedIn = loggedInUser !== null;

    // Hotels / Resorts according to destination
    const hotelsByDestination = {
        Goa: [
            "Taj Exotica Resort & Spa",
            "The Leela Goa",
            "ITC Grand Goa",
        ],

        Bali: [
            "The Apurva Kempinski Bali",
            "Hard Rock Hotel Bali",
            "Anantara Uluwatu Bali Resort",
        ],

        Kashmir: [
            "The Lalit Grand Palace Srinagar",
            "Vivanta Dal View",
            "The Khyber Himalayan Resort",
        ],

        Dubai: [
            "Atlantis The Palm",
            "Jumeirah Beach Hotel",
            "JW Marriott Hotel Dubai",
        ],

        Manali: [
            "The Himalayan",
            "Snow Valley Resorts",
            "Manali Heights",
        ],

        Ooty: [
            "Sterling Ooty Elk Hill",
            "Fortune Resort Sullivan Court",
            "Gem Park Ooty",
        ],
    };

    const createInitialForm = () => ({
        name: loggedInUser?.name || "",
        email: loggedInUser?.email || "",
        mobile: loggedInUser?.mobile || "",
        destination: "",
        hotel: "",
        roomType: "",
        roomFacility: "",
        roomView: "",
        date: "",
        travellers: "",
        paymentMethod: "",
        specialRequest: [],
        otherRequest: "",
    });

    const [formData, setFormData] = useState(createInitialForm);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "specialRequest" && type === "checkbox") {
            const updatedRequests = checked
                ? [...formData.specialRequest, value]
                : formData.specialRequest.filter(
                      (request) => request !== value
                  );

            setFormData({
                ...formData,
                specialRequest: updatedRequests,
            });

            return;
        }

        setFormData({
            ...formData,
            [name]: value,
            ...(name === "destination" && { hotel: "" }),
        });
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setBookingError("");

        if (!isLoggedIn) {
            setShowLoginPopup(true);
            return;
        }

        if (submitting) return;

        setSubmitting(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/bookings",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "authToken"
                        )}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to complete booking."
                );
            }

            alert(
                data.message || "Booking submitted successfully!"
            );

            setFormData(createInitialForm());
        } catch (error) {
            console.error("Booking error:", error);

            setBookingError(
                error.message === "Failed to fetch"
                    ? "Unable to connect to the server. Please try again."
                    : error.message || "Unable to complete booking."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Banner Section */}
            <section className="booking-banner">
                <img
                    src="/images/Booking_1.png"
                    alt="Booking Banner"
                />
            </section>

            {/* Booking Form */}
            <section className="booking-container">
                <div className="booking-form">
                    <h2>Book Your Dream Trip</h2>

                    <p>
                        Enter your travel details and select your
                        preferred payment method.
                    </p>

                    <form onSubmit={handleBooking}>
                        {/* Personal Details */}
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            readOnly
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            readOnly
                            required
                        />

                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile Number"
                            value={formData.mobile}
                            readOnly
                            required
                        />

                        {/* Destination */}
                        <select
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Destination
                            </option>

                            {Object.keys(hotelsByDestination).map(
                                (destination) => (
                                    <option
                                        key={destination}
                                        value={destination}
                                    >
                                        {destination}
                                    </option>
                                )
                            )}
                        </select>

                        {/* Hotel / Resort */}
                        <select
                            name="hotel"
                            value={formData.hotel}
                            onChange={handleChange}
                            required
                            disabled={!formData.destination}
                        >
                            <option value="">
                                {formData.destination
                                    ? "Select Hotel / Resort"
                                    : "Select Destination First"}
                            </option>

                            {(hotelsByDestination[
                                formData.destination
                            ] || []).map((hotel) => (
                                <option key={hotel} value={hotel}>
                                    {hotel}
                                </option>
                            ))}
                        </select>

                        {/* Room Type */}
                        <select
                            name="roomType"
                            value={formData.roomType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Room Type</option>
                            <option value="Standard Room">
                                Standard Room
                            </option>
                            <option value="Deluxe Room">
                                Deluxe Room
                            </option>
                            <option value="Suite">Suite</option>
                        </select>

                        {/* Room Facility */}
                        <select
                            name="roomFacility"
                            value={formData.roomFacility}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Room Facility
                            </option>
                            <option value="AC">AC</option>
                            <option value="Non-AC">Non-AC</option>
                        </select>

                        {/* Room View */}
                        <select
                            name="roomView"
                            value={formData.roomView}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Room View</option>
                            <option value="Sea / Beach View">
                                Sea / Beach View
                            </option>
                            <option value="Mountain View">
                                Mountain View
                            </option>
                            <option value="Garden View">
                                Garden View
                            </option>
                            <option value="City View">City View</option>
                        </select>

                        {/* Travel Date */}
                        <input
                            type="date"
                            name="date"
                            min={new Date().toLocaleDateString("en-CA")}
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />

                        {/* Travellers */}
                        <input
                            type="number"
                            name="travellers"
                            placeholder="Number of Travellers"
                            min="1"
                            value={formData.travellers}
                            onChange={handleChange}
                            required
                        />

                        {/* Payment Method */}
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Payment Method
                            </option>
                            <option value="UPI">UPI</option>
                            <option value="Credit / Debit Card">
                                Credit / Debit Card
                            </option>
                            <option value="Cash on Arrival">
                                Cash on Arrival
                            </option>
                        </select>

                        {/* Special Requests */}
                        <div className="special-request-section">
                            <h3>Special Requests</h3>

                            <p>
                                Select any additional services you need
                                for your stay.
                            </p>

                            <div className="special-request-options">
                                {[
                                    "Extra Bed",
                                    "Baby Cot",
                                    "Breakfast Included",
                                    "Early Check-in",
                                    "Late Check-out",
                                    "Birthday / Anniversary Decoration",
                                    "Parking Required",
                                    "Airport / Station Pickup",
                                    "Wheelchair Assistance",
                                    "Quiet Room",
                                ].map((request) => (
                                    <label key={request}>
                                        <input
                                            type="checkbox"
                                            name="specialRequest"
                                            value={request}
                                            checked={formData.specialRequest.includes(
                                                request
                                            )}
                                            onChange={handleChange}
                                        />

                                        {request}

                                        {[
                                            "Parking Required",
                                            "Airport / Station Pickup",
                                        ].includes(request) && (
                                            <span> — Free</span>
                                        )}
                                    </label>
                                ))}
                            </div>

                            <textarea
                                name="otherRequest"
                                rows="4"
                                placeholder="Other Request (Optional)"
                                value={formData.otherRequest}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Error Message */}
                        {bookingError && (
                            <p
                                className="booking-error"
                                role="alert"
                            >
                                {bookingError}
                            </p>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={submitting}>
                            {submitting
                                ? "Submitting..."
                                : "Confirm Booking"}
                        </button>
                    </form>
                </div>
            </section>

            {/* Login Required Popup */}
            {showLoginPopup && (
                <div className="booking-popup-overlay">
                    <div className="booking-popup">
                        <button
                            type="button"
                            className="popup-close"
                            onClick={() => setShowLoginPopup(false)}
                            aria-label="Close login popup"
                        >
                            <FaTimes />
                        </button>

                        <div className="popup-icon">
                            <FaLock />
                        </div>

                        <h2>Login Required</h2>

                        <p>
                            Please login or create an account before
                            booking your trip.
                        </p>

                        <Link
                            to="/login"
                            className="popup-login-btn"
                        >
                            Login
                        </Link>

                        <p className="popup-register-text">
                            Don't have an account?
                        </p>

                        <Link
                            to="/register"
                            className="popup-register-btn"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default Bookings;