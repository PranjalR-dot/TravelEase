
import './App.css';
import { useEffect } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    useLocation
} from 'react-router-dom';

import Navbar from './Components/Navbar';
import Footer from './Components/Footer';

import Home from './Pages/Home';
import About from './Pages/About';
import Packages from './Pages/Packages';
import Bookings from './Pages/Bookings';
import MyBookings from './Pages/MyBookings';
import Contact from './Pages/Contact';
import Login from './Pages/Login';
import Registration from './Pages/Registration';
import Admin from './Pages/Admin';
import AdminLogin from './Pages/AdminLogin';

function AppContent() {
    const location = useLocation();

    useEffect(() => {
        const isAdminPage =
            location.pathname === '/admin' ||
            location.pathname.startsWith('/admin/');

        if (isAdminPage || location.pathname === '/admin-login') {
            return;
        }

        let visitorId = localStorage.getItem('traveleaseVisitorId');

        if (!visitorId) {
            visitorId = window.crypto.randomUUID();
            localStorage.setItem('traveleaseVisitorId', visitorId);
        }

        const trackVisitor = async () => {
            try {
                const loggedInUser = JSON.parse(
                    localStorage.getItem('loggedInUser') || 'null'
                );

                const userId = loggedInUser?.id
                    ? String(loggedInUser.id)
                    : null;

                const identityKey = userId
                    ? `user_${userId}`
                    : `guest_${visitorId}`;

                const sessionKey =
                    `traveleaseVisitRecorded_${identityKey}`;

                if (sessionStorage.getItem(sessionKey)) {
                    return;
                }

                // Prevent simultaneous duplicate requests.
                sessionStorage.setItem(sessionKey, 'pending');

                const response = await fetch(
                    'http://localhost:5000/api/visitors',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...(userId ? { userId } : { visitorId }),
                            name: loggedInUser?.name || 'Guest',
                            email: loggedInUser?.email || 'Not provided'
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || 'Visitor tracking failed.'
                    );
                }

                sessionStorage.setItem(sessionKey, 'done');
                console.log('Visitor recorded:', data);

            } catch (error) {
                console.error('Visitor tracking error:', error);

                // Allow another attempt if tracking fails.
                const loggedInUser = JSON.parse(
                    localStorage.getItem('loggedInUser') || 'null'
                );

                const identityKey = loggedInUser?.id
                    ? `user_${loggedInUser.id}`
                    : `guest_${visitorId}`;

                sessionStorage.removeItem(
                    `traveleaseVisitRecorded_${identityKey}`
                );
            }
        };

        trackVisitor();
    }, [location.pathname]);

    const hideLayout =
        location.pathname === '/admin-login' ||
        location.pathname === '/admin';

    return (
        <>
            {!hideLayout && <Navbar />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />
             </Routes>

            {!hideLayout && <Footer />}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;