import "./Packages.css"
import { useEffect } from "react";
import { Link } from "react-router-dom";

function Packages() {

    useEffect(() =>{
        window.scrollTo(0,0);
    }, []);
    const packages = [
        {
            name : "Bali Escape",
            image : "/images/Bali.png",
            price : "₹39,999",
            duration : "5 Days / 4 Nights",
            description : "Experience breathtaking beaches, ancient temples, lush rice terraces and unforfettable sunsets in Bali."
        },

        {
            name : "Goa Beach Vacation",
            image : "/images/Goa.png",
            price : "₹12,999",
            duration : "4 Days / 3 Nights",
            description : "Enjoy golden beaches, exciting water sports, delicious seafood and vibrant nightlife in Goa."
        },

        {
            name : "Kashmir Paradise",
            image : "/images/Kashmir.png",
            price : "₹19,999",
            duration : "6 Days /53 Nights",
            description : "Explore snowy mountains, Dal Lake, beautiful valleys and breathtaking natyral scenery."
        },

        {
            name : "Dubai Luxury Tour",
            image : "/images/Dubai.png",
            price : "₹49,999",
            duration : "5 Days / 4 Nights",
            description : "Visit Burj Khalifa, enjoy luxury shopping, desert safari and world-class attractions."
        },

        {
            name : "Manali Adenture",
            image : "/images/Manali.png",
            price : "₹15,999",
            duration : "5 Days / 4 Nights",
            description : "Discover snowy peaks, adventure sports, scenic valleys and peaceful mountain views."
        },

        {
            name : "Ooty Hill Escape",
            image : "/images/Ooty.png",
            price : "₹14,999",
            duration : "4 Days / 3 Nights",
            description : "Relax among tea gardens, beautiful lakes and cool weather in the Quees of Hills."
        }
    ];

    return (
        <div className="packages-page">

            <div className="package-heading">

                <h1>Explore Our Packages</h1>

                <p>Choose your dream destination with TravelEase</p>
            </div>
                {packages.map((item, index) => (
                    
                    <div className={`package-card ${index % 2 !==0 ? "reverse" : ""}`} key={index}>

                        <div className="package-image">
                            <img src={item.image} alt={item.name} />
                        </div>

                        <div className="package-details">
                            
                            <h2>{item.name}</h2>

                            <p className="duration">{item.duration}</p>

                            <p>{item.description}</p>

                            <h3>{item.price}</h3>

                            <Link to="/bookings" className="book-btn">
                                Book Now
                            </Link>
                        </div>
                    </div>
                ))}

        </div>
    );
}

export default Packages;