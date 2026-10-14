import "./MyBookings.css";
import { useEffect, useState } from "react";

function MyBookings() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser") || "null"
    );

    const userEmail = loggedInUser?.email || "";

    const destinationImages = {
        bali: "/images/Bali_MyBooking.png",
        kashmir: "/images/Kashmir_MyBooking.png",
        goa: "/images/Goa_MyBooking.png",
        manali: "/images/Manali_MyBooking.png",
        dubai: "/images/Dubai_MyBooking.png",
        ooty: "/images/Ooty_MyBooking.png"
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("authToken");

                if (!token) {
                    setErrorMessage(
                        "Please log in again to view your bookings."
                    );
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/bookings/" +
                    encodeURIComponent(userEmail),
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    setErrorMessage(
                        data.message || "Unable to load your bookings."
                    );
                    return;
                }

                setBookings(
                    Array.isArray(data.bookings) ? data.bookings : []
                );
            } catch (error) {
                console.error("Error fetching bookings:", error);
                setErrorMessage(
                    "Unable to connect to the server. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        if (userEmail) {
            fetchBookings();
        } else {
            setErrorMessage("Please log in to view your bookings.");
            setLoading(false);
        }
    }, [userEmail]);

    if (loading) {
        return (
            <h2 className="booking-loading">
                Loading bookings...
            </h2>
        );
    }

    return (
        <div className="my-bookings-page">

            <section className="my-bookings-banner">
                <h1>My Bookings</h1>
                <p>Your journeys, your memories, all in one place.</p>
            </section>

            <section className="my-bookings-container">

                {errorMessage ? (
                    <div className="no-bookings">
                        <h2>Unable to Display Bookings</h2>
                        <p>{errorMessage}</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="no-bookings">
                        <h2>No Bookings Found</h2>
                        <p>You haven't made any bookings yet.</p>
                    </div>
                ) : (
                    bookings.map((booking, index) => {
                        const destinationKey =
                            (booking.destination || "").trim().toLowerCase();

                        const image =
                            destinationImages[destinationKey];

                        return (
                            <article
                                className="booking-card"
                                key={booking._id || index}
                            >

                                <div className="booking-card-header">

                                    {image && (
                                        <img
                                            className="booking-destination-image"
                                            src={image}
                                            alt={`${booking.destination} destination`}
                                            onError={(event) => {
                                                event.currentTarget.style.display = "none";
                                            }}
                                        />
                                    )}

                                    <div className="booking-heading">
                                        <span className="booking-label">
                                            YOUR TRAVEL RESERVATION
                                        </span>

                                        <h2>
                                            {booking.hotel || "Hotel / Resort"}
                                        </h2>

                                        <p className="booking-destination">
                                            {booking.destination}
                                        </p>

                                        <p className="booking-travel-date">
                                            Travel Date: {booking.date}
                                        </p>
                                    </div>

                                </div>

                                <div className="booking-details-section">
                                    <h3>Booking Details</h3>

                                    <div className="booking-details-grid">
                                        <div className="booking-detail">
                                            <span>Name</span>
                                            <strong>{booking.name}</strong>
                                        </div>

                                        <div className="booking-detail">
                                            <span>Email</span>
                                            <strong>{booking.email}</strong>
                                        </div>

                                        <div className="booking-detail">
                                            <span>Mobile</span>
                                            <strong>{booking.mobile}</strong>
                                        </div>

                                        <div className="booking-detail">
                                            <span>Room Type</span>
                                            <strong>{booking.roomType}</strong>
                                        </div>

                                        <div className="booking-detail">
                                            <span>Room Facility</span>
                                            <strong>{booking.roomFacility}</strong>
                                        </div>

                                        <div className="booking-detail">
                                            <span>Room View</span>
                                            <strong>{booking.roomView}</strong>
                                        </div>

                                        <div className="booking-detail">
                                            <span>Travellers</span>
                                            <strong>{booking.travellers}</strong>
                                        </div>

                                        <div className="booking-detail">
                                            <span>Payment Method</span>
                                            <strong>{booking.paymentMethod}</strong>
                                        </div>
                                    </div>
                                </div>

                                {(
                                    (Array.isArray(booking.specialRequest) &&
                                        booking.specialRequest.length > 0) ||
                                    booking.otherRequest
                                ) && (
                                    <div className="booking-requests-section">
                                        <h3>Special Requests</h3>

                                        {Array.isArray(booking.specialRequest) &&
                                            booking.specialRequest.length > 0 && (
                                                <ul className="booking-request-list">
                                                    {booking.specialRequest.map(
                                                        (request, requestIndex) => (
                                                            <li key={requestIndex}>
                                                                {request}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}

                                        {booking.otherRequest && (
                                            <p className="booking-other-request">
                                                <strong>Other Request:</strong>{" "}
                                                {booking.otherRequest}
                                            </p>
                                        )}
                                    </div>
                                )}

                            </article>
                        );
                    })
                )}

            </section>
        </div>
    );
}

export default MyBookings;
