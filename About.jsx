import "./About.css";
import { useEffect } from "react";
import {
    FaGlobeAsia,
    FaTags,
    FaShieldAlt,
    FaHeadset
} from "react-icons/fa";

function About() {

    useEffect(() => {
        window.scrollTo(0,0);
    }, []);
    return (
        <div className="about-page">

            {/* Banner */}

            <section className="about-banner">
                <img src="/images/img_3.png" alt="TravelEase About" />

                <div className="about-overlay">

                    <h1>About TravelEase</h1>
                    <p>Discover • Explore • Experience</p>
                </div>
            </section>

            {/* About Content */}

            <section className="about-content">
                <h1>About TravelEase</h1>

                <p>
                    TravelEase is your trusted travel partner dedicated to making every
                    journey simple, comfortable and unforgettable. Whether you dream of
                    relaxing on beautiful beaches, exploring breathtaking mountains or 
                    experiencing vibrant cities, we provide carefully planned travel
                    packages at affordable prices.
                </p>

                <p>
                    Our mission is to offer safe, affordable and memorable vacations
                    with excellent customer support and hassle-free booking. Thousands
                    of happy travellers choose TravelEase because we focus on quality,
                    comfort and customer satisfaction.
                </p>
            </section>

            {/* Why Choose Us*/}

            <section className="whu-us">
                <h2>Why Choose TravelEase ?</h2>
                <div className="features">
                    <div className="feature">
                        <FaGlobeAsia className="icon" />
                        
                        <h3>Amazing Destinations</h3>

                        <p>
                            Explore India's most beautiful tourist destinations with
                            professionally planned trips.
                        </p>
                    </div>

                    <div className="feature">
                        <FaTags className="icon" />
                        
                        <h3>Affordable Packages</h3>

                        <p>
                            Best prices with premium hotels, sightseeing and
                            transportation included.
                        </p>
                    </div>

                    <div className="feature">
                        <FaShieldAlt className="icon" />

                        <h3>Safe Travel</h3>

                        <p>
                            Your safety and comfort remain our highest priority
                            throughout every journey.
                        </p>
                    </div>

                    <div className="feature">
                        <FaHeadset className="icon" />

                        <h3>24*7 Customer Support</h3>

                        <p>
                            Our support team is always available to assist you
                            before, during and after your trip.
                        </p>
                    </div>
                </div>
            </section>

            {/* Gallery */}

            <section className="gallery">
                <h2>Travel Moments</h2>
                <div className="gallery-images">
                    <img src="/images/img_1.png" alt="Beach" />
                    <img src="/images/img_2.png" alt="Nature" />
                </div>
            </section>
        </div>
    );
}

export default About;