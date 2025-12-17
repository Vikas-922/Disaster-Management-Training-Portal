import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiFileOn } from "react-icons/ci";
import { authAPI } from "../utils/api";
import styles from "../styles/Register.module.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "ngo",
    state: "",
    district: "",
    address: "",
    contactPerson: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add(styles["dragging"]);
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove(styles["dragging"]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles["dragging"]);
    setFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "confirmPassword") {
          data.append(key, formData[key]);
        }
      });
      if (file) data.append("document", file);

      await authAPI.register(data);
      alert(
        "Registration submitted successfully! Please wait for admin approval."
      );
      navigate("/login?role=partner");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["register-container"]}>
      <div className={styles["register-card"]}>
        <div className={styles["register-header"]}>
          <h1 className={styles["register-title"]}>Partner Registration</h1>
          <p className={styles["register-subtitle"]}>
            Register your organization to submit training data
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className={styles["register-form"]}>
          {/* Organization Details */}
          <div className={styles["register-form-row"] + " " + styles["full"]}>
            <div className={styles["register-form-group"]}>
              <label>Organization Name</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles["register-form-row"]}>
            <div className={styles["register-form-group"]}>
              <label>Organization Type</label>
              <select
                name="organizationType"
                value={formData.organizationType}
                onChange={handleChange}
                required
              >
                <option value="govt">Government</option>
                <option value="ngo">NGO</option>
                <option value="private">Private</option>
                <option value="training">Training Institute</option>
              </select>
            </div>
            <div className={styles["register-form-group"]}>
              <label>State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                <option value="ap">Andhra Pradesh</option>
                <option value="ar">Arunachal Pradesh</option>
                <option value="as">Assam</option>
                {/* Add more states */}
              </select>
            </div>
          </div>

          <div className={styles["register-form-row"]}>
            <div className={styles["register-form-group"]}>
              <label>District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>
            <div className={styles["register-form-group"]}>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles["register-form-row"]}>
            <div className={styles["register-form-group"]}>
              <label>Contact Person Name</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles["register-form-group"]}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles["register-form-row"] + " " + styles["full"]}>
            <div className={styles["register-form-group"]}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Credentials */}
          <div className={styles["register-form-row"]}>
            <div className={styles["register-form-group"]}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles["register-form-group"]}>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className={styles["register-form-row"] + " " + styles["full"]}>
            <div className={styles["register-form-group"]}>
              <label>Authorization Documents (PDF)</label>
              <div
                className={styles["upload-box"]}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("doc-input").click()}
              >
                <div className={styles["upload-box-icon"]}>
                  <CiFileOn size={40} />
                </div>
                <div className={styles["upload-box-text"]}>
                  Drag and drop or click to upload
                </div>
                <input
                  id="doc-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className={styles["file-input"]}
                />
              </div>
              {file && (
                <div style={{ marginTop: "10px", fontSize: "13px" }}>
                  Selected: {file.name}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles["register-btn"]}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Organization"}
          </button>
        </form>

        <div className={styles["register-footer"]}>
          Already registered? <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
}
