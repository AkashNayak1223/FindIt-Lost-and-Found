
import { useState } from "react";
import "./App.css";

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

function App() {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState("Lost");

  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics",
    location: "",
    description: "",
  });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      location: formData.location,
      status: reportType,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      emoji: "📦",
      description: formData.description,
    };

    setItems((previousItems) => [newItem, ...previousItems]);
    setSearch("");
    setActiveFilter("All");
    setActiveCategory("All");
    setShowForm(false);

    alert(`${reportType} item reported successfully!`);
  };

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
          <button
            className="login-btn"
            onClick={() => alert("Login will be connected using Firebase soon!")}
          >
            Login
          </button>

          <button
            className="signup-btn"
            onClick={() => alert("Sign Up will be connected using Firebase soon!")}
          >
            Sign Up
          </button>
        </div>
      </nav>

      <main>
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

            <button onClick={() => document.getElementById("items")?.scrollIntoView({ behavior: "smooth" })}>
              Search
            </button>
          </div>
        </section>

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

          <div className="item-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div className="item-card" key={item.id}>
                  <div className="item-image">
                    <span>{item.emoji}</span>

                    <span
                      className={`status ${
                        item.status === "Lost" ? "lost" : "found"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="item-details">
                    <span className="item-category">
                      {item.category}
                    </span>

                    <h3>{item.name}</h3>
                    <p>📍 {item.location}</p>

                    {item.description && <p>{item.description}</p>}

                    <div className="item-date">{item.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">
                No matching items found.
              </p>
            )}
          </div>
        </section>

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

      <footer>
        <a href="#home" className="logo">
          🔎 Find<span>It</span>
        </a>

        <p>Connecting lost belongings with their rightful owners.</p>

        <p className="copyright">
          © 2026 FindIt. All rights reserved.
        </p>
      </footer>

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
    </div>
  );
}

export default App;
