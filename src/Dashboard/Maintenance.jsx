import React from "react";

export default function Maintenance() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{ minHeight: "100vh", padding: "2rem", backgroundColor: "#f8f9fa" }}
    >
      <div style={{ maxWidth: "400px", width: "100%"  }}>
        <img
          src="/images/maintiance.png"
          alt="Maintenance"
          loading="lazy"
          className="img-fluid mb-4"
          style={{ borderRadius: "18px" }}
        />
      </div>
      <div>
        <h1 className="mb-3 text-dark">🚧 We are currently under maintenance</h1>
        <p className="text-muted fs-5">
          We will be back soon, thank you for your patience.
        </p>
      </div>
    </div>
  );
}
