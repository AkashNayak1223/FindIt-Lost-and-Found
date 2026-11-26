
import { useState, useEffect } from "react";
import "./App.css";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";

const API_URL = "http://localhost:5000/api/items";

const initialItems = [
  {
    id: 1,
    name: "Black Wallet",
    category: "Accessories",
    location: "College Library",
    status: "Lost",
    date: "17 Nov 2026",
    emoji: "👛",
  },
  {
    id: 2,
    name: "Blue Water Bottle",
    category: "Personal Items",
    location: "Canteen",
    status: "Found",
    date: "16 Nov 2026",
    emoji: "🧴",
  },
  {
    id: 3,
    name: "Wireless Earbuds",
    category: "Electronics",
    location: "Computer Lab",
    status: "Found",
    date: "15 Nov 2026",
    emoji: "🎧",
  },
  {
    id: 4,
    name: "College ID Card",
    category: "Documents",
    location: "Main Block",
    status: "Lost",
    date: "14 Nov 2026",
    emoji: "🪪",
  },
];

const categories = [
  { name: "Electronics", emoji: "📱" },
  { name: "Bags", emoji: "🎒" },
  { name: "Accessories", emoji: "👛" },
  { name: "Books", emoji: "📚" },
  { name: "Documents", emoji: "🪪" },
  { name: "Other Items", emoji: "📦" },
];

// Format backend items for the frontend
const formatItems = (data) => {
  return data.map((item) => {
    let itemDate = "Recently reported";

    if (item.createdAt?._seconds) {
      itemDate = new Date(
        item.createdAt._seconds * 1000
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else if (item.createdAt) {
      const parsedDate = new Date(item.createdAt);

      if (!Number.isNaN(parsedDate.getTime())) {
        itemDate = parsedDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }

    return {
      id: item.id,
      name: item.itemName || "Unnamed Item",
      category: item.category || "Other Items",
      location: item.location || "Location not specified",
      status: item.status || "Lost",
      date: itemDate,
      emoji: "📦",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      userId: item.userId,
    };
  });
};

function App() {
  const [items, setItems] = useState(initialItems);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState("");

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState("Lost");

  // Firebase Authentication states
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics",
    location: "",
    description: "",
  });

  // Edit item states
  const [editingItem, setEditingItem] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    category: "",
    location: "",
    status: "Lost",
    description: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch items from backend
  const refreshItems = async () => {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to refresh items.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response received from backend.");
    }

    setItems(formatItems(data));
  };

  // Check Firebase login session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log("Firebase user authenticated successfully!");
      }
    });

    return () => unsubscribe();
  }, []);

  // Load items when the application starts
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setItemsLoading(true);
        setItemsError("");

        await refreshItems();

        console.log("Items fetched successfully!");
      } catch (error) {
        console.error("Error fetching items:", error);

        setItemsError(
          "Unable to load items from the backend. Please check whether the backend server is running."
        );
      } finally {
        setItemsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Open Login or Sign Up
  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthError("");

    setAuthData({
      name: "",
      email: "",
      password: "",
    });

    setShowAuth(true);
  };

  // Handle authentication input changes
  const handleAuthChange = (e) => {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value,
    });
  };

  // Firebase Login and Sign Up
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthLoading(true);

    try {
      let userCredential;

      if (authMode === "signup") {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          authData.email,
          authData.password
        );

        await updateProfile(userCredential.user, {
          displayName: authData.name,
        });

        setUser(userCredential.user);

        alert("Account created successfully!");
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          authData.email,
          authData.password
        );

        setUser(userCredential.user);

        alert("Login successful!");
      }

      console.log("Authentication completed successfully!");

      setShowAuth(false);

      setAuthData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Authentication error:", error);

      const errorMessages = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must contain at least 6 characters.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed":
          "Network error. Check your internet connection.",
      };

      setAuthError(
        errorMessages[error.code] ||
          error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // Firebase Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      alert("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out. Please try again.");
    }
  };

  // Open Lost or Found report form
  const openReport = (type) => {
    setReportType(type);

    setFormData({
      name: "",
      category: "Electronics",
      location: "",
      description: "",
    });

    setShowForm(true);
  };

  // Handle report form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit report to Express backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowForm(false);
      openAuth("login");
      alert("Please login before reporting an item.");
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemName: formData.name,
          category: formData.category,
          location: formData.location,
          status: reportType,
          description: formData.description,
          imageUrl: "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit report.");
      }

      await refreshItems();

      setSearch("");
      setActiveFilter("All");
      setActiveCategory("All");
      setShowForm(false);

      setFormData({
        name: "",
        category: "Electronics",
        location: "",
        description: "",
      });

      alert(`${reportType} item reported successfully!`);
    } catch (error) {
      console.error("Report submission error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    }
  };

  // Open Edit Item form
  const openEditForm = (item) => {
    setEditingItem(item);

    setEditData({
      name: item.name,
      category: item.category,
      location: item.location,
      status: item.status,
      description: item.description || "",
    });
  };

  // Handle Edit form changes
  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  // Update item through backend
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!user || !editingItem) {
      alert("Please login to edit your item.");
      return;
    }

    try {
      setActionLoading(true);

      const token = await user.getIdToken();

      const updateData = {
        itemName: editData.name.trim(),
        category: editData.category,
        location: editData.location.trim(),
        status: editData.status,
      };

      // Send description only when it is not empty.
      // The current backend rejects empty strings for updates.
      if (editData.description.trim()) {
        updateData.description = editData.description.trim();
      }

      const response = await fetch(`${API_URL}/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update item.");
      }

      await refreshItems();

      setEditingItem(null);

      alert("Item updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message || "Unable to update item.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete item through backend
  const handleDelete = async (item) => {
    if (!user) {
      alert("Please login to delete your item.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setActionLoading(true);

      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete item.");
      }

      await refreshItems();

      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Unable to delete item.");
    } finally {
      setActionLoading(false);
    }
  };

  // Search and filter items
  const filteredItems = items.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.location.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText);

    const matchesFilter =
      activeFilter === "All" || item.status === activeFilter;

    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Other Items"
        ? !categories.slice(0, 5).some(
            (category) => category.name === item.category
          )
        : item.category === activeCategory);

    return matchesSearch && matchesFilter && matchesCategory;
  });

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">🔎</span>
          Find<span>It</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#items">Browse Items</a>
          <a href="#categories">Categories</a>
        </div>

        <div className="nav-buttons">
          {user ? (
            <>
              <span className="user-name">
                Hi, {user.displayName || user.email}
              </span>

              <button className="login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => openAuth("login")}
              >
                Login
              </button>

              <button
                className="signup-btn"
                onClick={() => openAuth("signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="tagline">
              YOUR COMMUNITY LOST & FOUND PORTAL
            </span>

            <h1>
              Lost Something?
              <br />
              <span>Let's Find It.</span>
            </h1>

            <p>
              Don't worry! FindIt helps you reconnect with your
              lost belongings. Report, search and recover items
              easily within your campus.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() => openReport("Lost")}
              >
                Report Lost Item →
              </button>

              <button
                className="secondary-btn"
                onClick={() => openReport("Found")}
              >
                Report Found Item
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <h3>{items.length}+</h3>
                <p>Items Reported</p>
              </div>

              <div>
                <h3>0+</h3>
                <p>Items Recovered</p>
              </div>

              <div>
                <h3>50+</h3>
                <p>Happy Students</p>
              </div>
            </div>
          </div>

          <div className="hero-illustration">
            <div className="illustration-circle">
              <span>🎒</span>
              <span className="floating-item">🔑</span>
              <span className="floating-item second">📱</span>
              <span className="floating-item third">👛</span>
            </div>

            <div className="illustration-label">
              <span>✨</span> Every lost item deserves to be found!
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="search-section">
          <h2>Find Your Lost Belongings</h2>
          <p>Search through reported lost and found items.</p>

          <div className="search-box">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search by item name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              onClick={() =>
                document.getElementById("items")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Search
            </button>
          </div>
        </section>

        {/* Categories */}
        <section className="categories" id="categories">
          <div className="section-heading">
            <div>
              <h2>Browse Categories</h2>
              <p>Explore items based on their category.</p>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <button
                type="button"
                className={`category-card ${
                  activeCategory === category.name ? "selected" : ""
                }`}
                key={category.name}
                onClick={() => {
                  setActiveCategory(
                    activeCategory === category.name ? "All" : category.name
                  );

                  document.getElementById("items")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                <span>{category.emoji}</span>
                <h3>{category.name}</h3>
              </button>
            ))}
          </div>
        </section>

        {/* Items Section */}
        <section className="items-section" id="items">
          <div className="section-heading">
            <div>
              <h2>Recently Reported Items</h2>
              <p>Check out the latest lost and found reports.</p>
            </div>
          </div>

          <div className="filter-buttons">
            {["All", "Lost", "Found"].map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {activeCategory !== "All" && (
            <p className="active-category">
              Category: {activeCategory}
              <button onClick={() => setActiveCategory("All")}>
                Clear filter ✕
              </button>
            </p>
          )}

          {itemsLoading && (
            <p className="no-results">Loading items...</p>
          )}

          {!itemsLoading && itemsError && (
            <div className="no-results">
              <p>{itemsError}</p>
              <button
                className="secondary-btn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {!itemsLoading && !itemsError && (
            <div className="item-grid">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div className="item-card" key={item.id}>
                    <div className="item-image">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="item-photo"
                        />
                      ) : (
                        <span>{item.emoji}</span>
                      )}

                      <span
                        className={`status ${
                          item.status === "Lost" ? "lost" : "found"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="item-details">
                      <span className="item-category">{item.category}</span>

                      <h3>{item.name}</h3>
                      <p>📍 {item.location}</p>

                      {item.description && <p>{item.description}</p>}

                      <div className="item-date">{item.date}</div>

                      {/* Edit and Delete buttons for the item's owner */}
                      {user && item.userId === user.uid && (
                        <div
                          className="item-actions"
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "15px",
                          }}
                        >
                          <button
                            type="button"
                            className="edit-btn"
                            disabled={actionLoading}
                            onClick={() => openEditForm(item)}
                            style={{
                              padding: "9px 16px",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "#2563eb",
                              color: "white",
                              cursor: "pointer",
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            disabled={actionLoading}
                            onClick={() => handleDelete(item)}
                            style={{
                              padding: "9px 16px",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "#dc2626",
                              color: "white",
                              cursor: "pointer",
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-results">No matching items found.</p>
              )}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <h2>Found Something That Belongs to Someone?</h2>

          <p>
            Your small action could make someone's day.
            Report the item and help reunite it with its owner.
          </p>

          <button
            className="primary-btn"
            onClick={() => openReport("Found")}
          >
            Report a Found Item →
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <a href="#home" className="logo">
          🔎 Find<span>It</span>
        </a>

        <p>Connecting lost belongings with their rightful owners.</p>

        <p className="copyright">
          © 2026 FindIt. All rights reserved.
        </p>
      </footer>

      {/* Firebase Login / Sign Up Modal */}
      {showAuth && (
        <div
          className="modal-overlay"
          onClick={() => setShowAuth(false)}
        >
          <div
            className="report-modal auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              type="button"
              onClick={() => setShowAuth(false)}
            >
              ✕
            </button>

            <h2>
              {authMode === "login" ? "Welcome Back!" : "Create Account"}
            </h2>

            <p>
              {authMode === "login"
                ? "Login to your FindIt account."
                : "Join FindIt and help your campus community."}
            </p>

            <form onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <>
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={authData.name}
                    onChange={handleAuthChange}
                    required
                  />
                </>
              )}

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={authData.email}
                onChange={handleAuthChange}
                required
              />

              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={authData.password}
                onChange={handleAuthChange}
                minLength={6}
                required
              />

              {authError && (
                <p className="auth-error" role="alert">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="primary-btn submit-btn"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => {
                  setAuthMode(
                    authMode === "login" ? "signup" : "login"
                  );

                  setAuthError("");

                  setAuthData({
                    name: "",
                    email: "",
                    password: "",
                  });
                }}
              >
                {authMode === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Report Form */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              type="button"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

            <h2>Report {reportType} Item</h2>
            <p>Enter the details of the item below.</p>

            <form onSubmit={handleSubmit}>
              <label>Item Name</label>

              <input
                type="text"
                name="name"
                placeholder="Example: Black Wallet"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Personal Items</option>
                <option>Documents</option>
                <option>Bags</option>
                <option>Books</option>
                <option>Other Items</option>
              </select>

              <label>Location</label>

              <input
                type="text"
                name="location"
                placeholder="Where was it lost or found?"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <label>Description (optional)</label>

              <textarea
                name="description"
                placeholder="Add some details about the item..."
                value={formData.description}
                onChange={handleChange}
              />

              <button type="submit" className="primary-btn submit-btn">
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!actionLoading) setEditingItem(null);
          }}
        >
          <div
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              type="button"
              disabled={actionLoading}
              onClick={() => setEditingItem(null)}
            >
              ✕
            </button>

            <h2>Edit Item</h2>
            <p>Update the details of your reported item.</p>

            <form onSubmit={handleEditSubmit}>
              <label>Item Name</label>

              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                required
              />

              <label>Category</label>

              <select
                name="category"
                value={editData.category}
                onChange={handleEditChange}
                required
              >
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Personal Items</option>
                <option>Documents</option>
                <option>Bags</option>
                <option>Books</option>
                <option>Other Items</option>
              </select>

              <label>Location</label>

              <input
                type="text"
                name="location"
                value={editData.location}
                onChange={handleEditChange}
                required
              />

              <label>Status</label>

              <select
                name="status"
                value={editData.status}
                onChange={handleEditChange}
                required
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>

              <label>Description (optional)</label>

              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
              />

              <button
                type="submit"
                className="primary-btn submit-btn"
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
