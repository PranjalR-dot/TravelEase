import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {

    return (
        <footer className="footer">

            <p>
                © 2026 TravelEase. All Rights Reserved.
            </p>

            <Link to="/admin-login" className="admin-footer-link">
                Admin Login
            </Link>

        </footer>
    );
}

export default Footer;