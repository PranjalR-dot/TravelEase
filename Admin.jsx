
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorError, setVisitorError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [updatingMessage, setUpdatingMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (
      localStorage.getItem("adminLoggedIn") !== "true" ||
      !token
    ) {
      navigate("/admin-login", { replace: true });
      return;
    }

    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setVisitorError("");
    setMessageError("");

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const visitorRequest = fetch(
      "http://localhost:5000/api/visitors",
      { headers: authHeaders }
    );

    const messageRequest = fetch(
      "http://localhost:5000/api/contact-messages",
      { headers: authHeaders }
    );

    try {
      const [visitorResponse, messageResponse] =
        await Promise.allSettled([
          visitorRequest,
          messageRequest,
        ]);

      if (visitorResponse.status === "fulfilled") {
        const response = visitorResponse.value;

        if (!response.ok) {
          throw new Error("Unable to load website visitors.");
        }

        const data = await response.json();

        if (data.success) {
          setVisitors(
            Array.isArray(data.visitors) ? data.visitors : []
          );
        } else {
          throw new Error(
            data.message || "Unable to load website visitors."
          );
        }
      } else {
        setVisitorError("Unable to connect to the visitors API.");
      }

      if (messageResponse.status === "fulfilled") {
        const response = messageResponse.value;

        if (!response.ok) {
          throw new Error("Unable to load contact messages.");
        }

        const data = await response.json();

        if (data.success) {
          setMessages(
            Array.isArray(data.messages) ? data.messages : []
          );
        } else {
          throw new Error(
            data.message || "Unable to load contact messages."
          );
        }
      } else {
        setMessageError(
          "Unable to connect to the contact messages API."
        );
      }
    } catch (error) {
      console.error("Admin data error:", error);

      if (!visitors.length) {
        setVisitorError(
          "Some dashboard data could not be loaded. Please try refreshing."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = messages.filter(
    (message) => !message.read
  ).length;

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString();
  };

  const getVisitorName = (visitor) => {
    return visitor.name || "Guest Visitor";
  };

  const getVisitorInitial = (visitor) => {
    return getVisitorName(visitor).charAt(0).toUpperCase();
  };

  const getVisitCount = (visitor) => {
    // Older records may not have visitCount.
    return visitor.visitCount ?? "Not recorded";
  };

  const getFirstVisit = (visitor) => {
    return formatDate(
      visitor.firstVisit || visitor.visitTime
    );
  };

  const getLastVisit = (visitor) => {
    return formatDate(
      visitor.lastVisit || visitor.visitTime
    );
  };

  const getVisitHistory = (visitor) => {
    if (
      Array.isArray(visitor.visitHistory) &&
      visitor.visitHistory.length > 0
    ) {
      return visitor.visitHistory;
    }

    // Support older records that only contain visitTime.
    if (visitor.visitTime) {
      return [visitor.visitTime];
    }

    return [];
  };

  const markMessageAsRead = async (messageId) => {
    if (!messageId || updatingMessage) return;

    setUpdatingMessage(messageId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/contact-messages/${messageId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not mark message as read."
        );
      }

      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message._id === messageId
            ? { ...message, read: true }
            : message
        )
      );
    } catch (error) {
      console.error("Mark as read error:", error);
      window.alert(
        error.message || "Could not mark message as read."
      );
    } finally {
      setUpdatingMessage("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminToken");
    navigate("/", { replace: true });
  };

  const showSection = (section) => {
    setActiveSection(section);
  };

  const latestVisitors = [...visitors].sort((a, b) => {
    const dateA = new Date(
      a.lastVisit || a.visitTime || a.createdAt || 0
    ).getTime();

    const dateB = new Date(
      b.lastVisit || b.visitTime || b.createdAt || 0
    ).getTime();

    return dateB - dateA;
  });

  const latestMessages = [...messages].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    return dateB - dateA;
  });

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">T</div>

          <div>
            <h2>TravelEase</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <div className="admin-sidebar-label">
          MAIN MENU
        </div>

        <nav className="admin-navigation">
          <button
            type="button"
            className={`admin-nav-button ${
              activeSection === "dashboard" ? "active" : ""
            }`}
            onClick={() => showSection("dashboard")}
          >
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`admin-nav-button ${
              activeSection === "visitors" ? "active" : ""
            }`}
            onClick={() => showSection("visitors")}
          >
            <span className="nav-icon">◉</span>
            <span>Website Visitors</span>
            <span className="nav-count">{visitors.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-button ${
              activeSection === "messages" ? "active" : ""
            }`}
            onClick={() => showSection("messages")}
          >
            <span className="nav-icon">✉</span>
            <span>Contact Messages</span>

            {unreadCount > 0 && (
              <span className="nav-count unread-badge">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-profile-avatar">A</div>

            <div className="admin-profile-details">
              <strong>Administrator</strong>
              <span>TravelEase Admin</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <span className="nav-icon">↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">
              TravelEase <span>/</span> Admin
            </p>

            <h1>
              {activeSection === "dashboard" && "Dashboard"}
              {activeSection === "visitors" && "Website Visitors"}
              {activeSection === "messages" && "Contact Messages"}
            </h1>
          </div>

          <div className="admin-topbar-actions">
            <span className="admin-status-dot" />
            <span className="admin-online-text">Admin Portal</span>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={fetchAdminData}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        <div className="admin-content">
          {loading && (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <p>Loading your dashboard...</p>
            </div>
          )}

          {!loading && (
            <>
              {activeSection === "dashboard" && (
                <section>
                  <div className="admin-welcome">
                    <div>
                      <p className="welcome-eyebrow">
                        ADMIN OVERVIEW
                      </p>

                      <h2>Welcome back, Admin!</h2>

                      <p>
                        Here’s what’s happening on your TravelEase
                        website.
                      </p>
                    </div>

                    <div className="welcome-decoration">✈</div>
                  </div>

                  <div className="admin-stats-grid">
                    <article className="admin-stat-card">
                      <div className="stat-card-top">
                        <span className="stat-icon visitors-icon">
                          ◉
                        </span>
                        <span className="stat-label">
                          Website Visitors
                        </span>
                      </div>

                      <h3>{visitors.length}</h3>

                      <p>
                        Unique visitor records
                      </p>
                    </article>

                    <article className="admin-stat-card">
                      <div className="stat-card-top">
                        <span className="stat-icon messages-icon">
                          ✉
                        </span>
                        <span className="stat-label">
                          Contact Messages
                        </span>
                      </div>

                      <h3>{messages.length}</h3>

                      <p>Messages received</p>
                    </article>

                    <article className="admin-stat-card">
                      <div className="stat-card-top">
                        <span className="stat-icon unread-icon">
                          !
                        </span>
                        <span className="stat-label">
                          Unread Messages
                        </span>
                      </div>

                      <h3>{unreadCount}</h3>

                      <p>Messages needing attention</p>
                    </article>
                  </div>

                  <div className="admin-quick-actions">
                    <div className="admin-section-heading">
                      <div>
                        <p className="section-eyebrow">
                          QUICK ACCESS
                        </p>
                        <h2>Manage your website</h2>
                      </div>
                    </div>

                    <div className="quick-action-grid">
                      <button
                        type="button"
                        className="quick-action-card"
                        onClick={() => showSection("visitors")}
                      >
                        <span className="quick-action-icon">
                          ◉
                        </span>
                        <span>
                          <strong>Website Visitors</strong>
                          <small>
                            View visit counts and history
                          </small>
                        </span>
                        <span className="quick-action-arrow">
                          →
                        </span>
                      </button>

                      <button
                        type="button"
                        className="quick-action-card"
                        onClick={() => showSection("messages")}
                      >
                        <span className="quick-action-icon message-action-icon">
                          ✉
                        </span>
                        <span>
                          <strong>Contact Messages</strong>
                          <small>
                            Review customer enquiries
                          </small>
                        </span>
                        <span className="quick-action-arrow">
                          →
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="admin-recent-activity">
                    <div className="admin-section-heading">
                      <div>
                        <p className="section-eyebrow">
                          RECENT ACTIVITY
                        </p>
                        <h2>Latest visitors</h2>
                      </div>

                      <button
                        type="button"
                        className="text-action-button"
                        onClick={() => showSection("visitors")}
                      >
                        View all →
                      </button>
                    </div>

                    {visitorError && (
                      <div className="admin-error">
                        {visitorError}
                      </div>
                    )}

                    {latestVisitors.length === 0 ? (
                      <div className="admin-empty-state">
                        <span className="empty-state-icon">◉</span>
                        <h3>No visitors yet</h3>
                        <p>
                          Visitor records will appear here when
                          the backend saves them.
                        </p>
                      </div>
                    ) : (
                      <div className="admin-record-list">
                        {latestVisitors.slice(0, 3).map(
                          (visitor, index) => (
                            <article
                              className="admin-record-card"
                              key={visitor._id || index}
                            >
                              <div className="record-avatar">
                                {getVisitorInitial(visitor)}
                              </div>

                              <div className="record-details">
                                <h3>
                                  {getVisitorName(visitor)}
                                </h3>

                                <p>
                                  {visitor.email ||
                                    "Email not provided"}
                                </p>
                              </div>

                              <div className="record-side-info">
                                <span className="record-count">
                                  {getVisitCount(visitor)} visits
                                </span>

                                <small>
                                  Last visit:{" "}
                                  {getLastVisit(visitor)}
                                </small>
                              </div>
                            </article>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeSection === "visitors" && (
                <section>
                  <div className="admin-section-heading page-section-heading">
                    <div>
                      <p className="section-eyebrow">
                        WEBSITE ANALYTICS
                      </p>

                      <h2>Visitor records</h2>

                      <p className="section-description">
                        Review visitor details, total visits, and
                        their recorded visit history.
                      </p>
                    </div>

                    <span className="section-total">
                      {visitors.length} records
                    </span>
                  </div>

                  {visitorError && (
                    <div className="admin-error">
                      {visitorError}
                    </div>
                  )}

                  {visitors.length === 0 ? (
                    <div className="admin-empty-state">
                      <span className="empty-state-icon">◉</span>
                      <h3>No visitor records found</h3>
                      <p>
                        Visitor information will appear here after
                        it is saved in MongoDB.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-record-list">
                      {latestVisitors.map((visitor, index) => {
                        const history = getVisitHistory(visitor);

                        return (
                          <article
                            className="admin-record-card visitor-record-card"
                            key={visitor._id || index}
                          >
                            <div className="record-avatar">
                              {getVisitorInitial(visitor)}
                            </div>

                            <div className="record-details">
                              <h3>
                                {getVisitorName(visitor)}
                              </h3>

                              <p>
                                <strong>Email:</strong>{" "}
                                {visitor.email ||
                                  "Email not provided"}
                              </p>

                              <div className="visitor-info-grid">
                                <div className="visitor-info-item">
                                  <span>Total visits</span>
                                  <strong>
                                    {getVisitCount(visitor)}
                                  </strong>
                                </div>

                                <div className="visitor-info-item">
                                  <span>First visit</span>
                                  <strong>
                                    {getFirstVisit(visitor)}
                                  </strong>
                                </div>

                                <div className="visitor-info-item">
                                  <span>Last visit</span>
                                  <strong>
                                    {getLastVisit(visitor)}
                                  </strong>
                                </div>
                              </div>

                              {history.length > 0 && (
                                <details className="visitor-history">
                                  <summary>
                                    View visit history ({history.length})
                                  </summary>

                                  <ul>
                                    {history.map((visit, historyIndex) => (
                                      <li key={historyIndex}>
                                        <span className="history-dot" />
                                        <span>
                                          {formatDate(
                                            typeof visit === "object" &&
                                              visit !== null
                                              ? visit.visitedAt ||
                                                visit.visitTime ||
                                                visit.date
                                              : visit
                                          )}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </details>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {activeSection === "messages" && (
                <section>
                  <div className="admin-section-heading page-section-heading">
                    <div>
                      <p className="section-eyebrow">
                        CUSTOMER SUPPORT
                      </p>

                      <h2>Contact messages</h2>

                      <p className="section-description">
                        Read enquiries submitted through the
                        TravelEase contact form.
                      </p>
                    </div>

                    <span className="section-total">
                      {unreadCount} unread
                    </span>
                  </div>

                  {messageError && (
                    <div className="admin-error">
                      {messageError}
                    </div>
                  )}

                  {messages.length === 0 ? (
                    <div className="admin-empty-state">
                      <span className="empty-state-icon">✉</span>
                      <h3>No contact messages</h3>
                      <p>
                        Messages submitted through your contact
                        form will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-record-list">
                      {latestMessages.map((message, index) => (
                        <article
                          className={`admin-record-card message-record-card ${
                            message.read ? "message-read" : "message-unread"
                          }`}
                          key={message._id || index}
                        >
                          <div className="record-avatar message-avatar">
                            {(message.name || "M")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="record-details message-details">
                            <div className="message-heading-row">
                              <h3>
                                {message.subject ||
                                  "General enquiry"}
                              </h3>

                              <span
                                className={`message-status ${
                                  message.read
                                    ? "status-read"
                                    : "status-unread"
                                }`}
                              >
                                {message.read ? "Read" : "Unread"}
                              </span>
                            </div>

                            <p>
                              <strong>Name:</strong>{" "}
                              {message.name || "Not provided"}
                            </p>

                            <p>
                              <strong>Email:</strong>{" "}
                              {message.email || "Not provided"}
                            </p>

                            <p className="message-body">
                              {message.message ||
                                "No message content"}
                            </p>

                            <div className="message-footer">
                              <small>
                                Received: {formatDate(message.createdAt)}
                              </small>

                              {!message.read && (
                                <button
                                  type="button"
                                  className="mark-read-button"
                                  onClick={() =>
                                    markMessageAsRead(message._id)
                                  }
                                  disabled={
                                    updatingMessage === message._id
                                  }
                                >
                                  {updatingMessage === message._id
                                    ? "Updating..."
                                    : "✓ Mark as Read"}
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        <footer className="admin-footer">
          <p>
            © {new Date().getFullYear()} TravelEase. Admin Dashboard.
          </p>
          <span>Travel more. Worry less.</span>
        </footer>
      </main>
    </div>
  );
}

export default Admin;