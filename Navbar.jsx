import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
function Navbar() {

    const navigate = useNavigate();

    const loggedInUser = localStorage.getItem("loggedInUser");

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        navigate("/");
        window.location.reload();
    }
    return (
        <nav className="navbar">
            <div className="logo">
                <img src="/images/logo.png" alt="TravelEase Logo" />
                <h2>TravelEase</h2>
            </div>
            <ul className="nav-links">
                <li>
                    <Link to="/">Home</Link>
                </li>

                <li>
                    <Link to="/about">About</Link>
                </li>

                <li>
                    <Link to="/packages">Packages</Link>
                </li>

                <li>
                    <Link to="/bookings">Bookings</Link>
                </li>

                <li>
                    <Link to="/my-bookings">My Bookings</Link>
                </li>

                <li>
                    <Link to="/contact">Contact</Link>
                </li>

                {loggedInUser ? (
                    <li>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </li>
                ) : (
                    <>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>

                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                    </>
                
                )}
            </ul>
        </nav>
    );
}

export default Navbar;