import { useEffect, useState } from "react";

const SELF_HOSTING_PASSWORD = "llamacloud-self-host-2025";
const STORAGE_KEY = "llamacloud-self-hosting-auth";

export default function ProtectedContent({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === SELF_HOSTING_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, "true");
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    setPassword("");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "2rem auto",
          padding: "2rem",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Self-Hosting Documentation Access
        </h2>
        <p
          style={{ textAlign: "center", marginBottom: "1.5rem", color: "#666" }}
        >
          This section requires a password to access. Interested in
          self-hosting?{" "}
          <a href="https://www.llamaindex.ai/contact">Contact sales</a> to learn
          more.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="password"
              style={{ display: "block", marginBottom: "0.5rem" }}
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
              required
            />
          </div>
          {error && (
            <p
              style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#007cba",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Access Documentation
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          textAlign: "right",
          marginBottom: "1rem",
          padding: "0.5rem",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
        }}
      >
        <small style={{ marginRight: "1rem", color: "#666" }}>
          Self-Hosting Documentation Access Granted
        </small>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.25rem 0.5rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "3px",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
