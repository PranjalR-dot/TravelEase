
import "./AdminLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/admin-login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success && data.token) {

                localStorage.setItem("adminLoggedIn", "true");
                localStorage.setItem("adminToken", data.token);

                navigate("/admin");

            } else {

                alert(data.message || "Invalid Admin Username or Password.");

            }

        } catch (error) {

            console.error("Admin Login Error:", error);

            alert("Unable to connect to the server. Please try again.");

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-box">

                <h1>Admin Login</h1>

                <p>TravelEase Administration</p>

                <form onSubmit={handleLogin}>

                    <input
                        type="text"
                        placeholder="Admin Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AdminLogin;
