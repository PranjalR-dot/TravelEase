import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home"> 

            {/* Hero Banner */}

            <section className="hero">
                <img src="/images\hero.png" alt="TravelEase Banner" />
            </section>

            {/* Buttons */}

            <section className="home-buttons">

                <Link to="/packages" className="btn">
                    Explore Packages                
                </Link>

                <Link to="/bookings" className="btn book-btn">
                    Book Now
                </Link>
            </section>

            {/* About */}

            <section className="about-home">
                <p>TravelEase is your trusted travel partner, offering exciting domestic
                    and international tour packages at affordable prices. We make every
                    journey comfortable, memorable and hassle-free with secure booking
                    and excellent customer services.
                </p>

                <Link to="/about" className="read-btn">
                    Read More
                </Link>
            </section>
        </div>
    );
}

export default Home;