import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CiCamera, CiFileOn } from "react-icons/ci";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "../components/Sidebar";
import { trainingAPI, uploadAPI } from "../utils/api";
import statesDistrictsData from "../data/statesDistricts.json";
import styles from "../styles/Form.module.css";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Extract data from JSON
const stateDistrictMap = statesDistrictsData.districts;
const stateList = statesDistrictsData.states;

// Location Picker Component
function LocationPicker({ onLocationSelect, initialLat, initialLng }) {
  const [position, setPosition] = useState([
    initialLat || 20.5937,
    initialLng || 78.9629,
  ]); // India center

  function LocationMarker() {
    const map = useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });

    return position ? (
      <Marker position={position}>
        <Popup>
          Location: {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </Popup>
      </Marker>
    ) : null;
  }

  return (
    <MapContainer
      center={position}
      zoom={5}
      style={{ height: "300px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}

export default function AddTraining() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    theme: "",
    startDate: "",
    endDate: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: "",
    trainerName: "",
    trainerEmail: "",
    participantsCount: "",
  });
  const [photos, setPhotos] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset district when state changes
    if (name === "state") {
      setFormData((prev) => ({ ...prev, [name]: value, district: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e) => {
    setPhotos([...photos, ...Array.from(e.target.files)]);
  };

  const handleCSVUpload = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Upload photos through backend to Cloudinary if any
      let photoUrls = [];
      if (photos.length > 0) {
        setUploadingPhotos(true);
        const uploadResponse = await uploadAPI.uploadMultiple(
          photos,
          "training-photos"
        );
        setUploadingPhotos(false);

        if (!uploadResponse.data.success) {
          throw new Error(uploadResponse.data.error || "Photo upload failed");
        }

        photoUrls = uploadResponse.data.data.map((file) => ({
          url: file.url,
          publicId: file.publicId,
          filename: file.filename, // Include filename from API response
        }));
      }

      // Upload CSV file through backend to Cloudinary if any
      let attendanceSheetData = null;
      if (csvFile) {
        setUploadingPhotos(true);
        const csvUploadResponse = await uploadAPI.uploadSingle(
          csvFile,
          "training-attendance"
        );
        setUploadingPhotos(false);

        if (!csvUploadResponse.data.success) {
          throw new Error(csvUploadResponse.data.error || "CSV upload failed");
        }

        attendanceSheetData = {
          url: csvUploadResponse.data.data.url,
          publicId: csvUploadResponse.data.data.publicId,
          filename: csvUploadResponse.data.data.filename, // Use filename from API response
        };
      }

      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        formPayload.append(key, formData[key]);
      });

      // Add photo URLs as JSON string
      if (photoUrls.length > 0) {
        formPayload.append(
          "photos",
          JSON.stringify(
            photoUrls.map((p) => ({
              url: p.url,
              publicId: p.publicId,
              filename: p.filename,
            }))
          )
        );
      }

      // Add attendance sheet URL
      if (attendanceSheetData) {
        formPayload.append(
          "attendanceSheet",
          JSON.stringify(attendanceSheetData)
        );
      }

      await trainingAPI.create(formPayload);
      alert("Training event submitted successfully!");
      navigate("/partner/my-trainings");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit training event"
      );
    } finally {
      setLoading(false);
      setUploadingPhotos(false);
    }
  };

  return (
    <div className="layout-container">
      <Sidebar role="partner" />
      <div className="main-content">
        <div className="top-nav">
          <h2 className="nav-title">Add New Training Event</h2>
        </div>

        <div className="page-content">
          <div className={styles["form-container"]}>
            <div className={styles["form-card"]}>
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Event Details */}
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Submit New Training Event
                  </h3>

                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label>Training Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Flood Rescue Training"
                        required
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Theme</label>
                      <select
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Theme</option>
                        <option value="flood">Flood Rescue</option>
                        <option value="earthquake">
                          Earthquake Preparedness
                        </option>
                        <option value="cyclone">Cyclone Management</option>
                        <option value="first-aid">First Aid</option>
                        <option value="fire">Fire Safety</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Location Details
                  </h3>

                  <div
                    className={styles["form-row"] + " " + styles["three-col"]}
                  >
                    <div className={styles["form-group"]}>
                      <label>State</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select State</option>
                        {stateList.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles["form-group"]}>
                      <label>District</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                        disabled={!formData.state}
                      >
                        <option value="">
                          {formData.state
                            ? "Select District"
                            : "Select State First"}
                        </option>
                        {formData.state &&
                          stateDistrictMap[formData.state]?.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className={styles["form-group"]}>
                      <label>City/Village</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City or Village"
                      />
                    </div>
                  </div>

                  <div
                    className={styles["form-row"] + " " + styles["three-col"]}
                  >
                    <div className={styles["form-group"]}>
                      <label>Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="e.g., 400001"
                        maxLength="6"
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Latitude</label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="Click on map or enter manually"
                        step="0.0001"
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Longitude</label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="Click on map or enter manually"
                        step="0.0001"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "20px" }}>
                    <label
                      style={{
                        marginBottom: "10px",
                        display: "block",
                        fontWeight: "600",
                      }}
                    >
                      Select Location on Map
                    </label>
                    <div
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <LocationPicker
                        onLocationSelect={(lat, lng) => {
                          setFormData((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                          }));
                        }}
                        initialLat={formData.latitude}
                        initialLng={formData.longitude}
                      />
                    </div>
                    <small
                      style={{
                        marginTop: "8px",
                        display: "block",
                        color: "#666",
                      }}
                    >
                      Click on the map to select the exact location of your
                      training event
                    </small>
                  </div>
                </div>

                {/* Resource Person Details */}
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Resource Person(s)
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 0.7fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div className={styles["form-group"]}>
                      <label>Trainer Name</label>
                      <input
                        type="text"
                        name="trainerName"
                        value={formData.trainerName}
                        onChange={handleChange}
                        placeholder="Full name"
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Trainer Email</label>
                      <input
                        type="email"
                        name="trainerEmail"
                        value={formData.trainerEmail}
                        onChange={handleChange}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Participants Count</label>
                      <input
                        type="number"
                        name="participantsCount"
                        value={formData.participantsCount}
                        onChange={handleChange}
                        placeholder="Total"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Uploads */}
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>Uploads</h3>

                  <div className={styles["uploads-section"]}>
                    <div>
                      <label style={{ marginBottom: "15px", display: "block" }}>
                        Event Photos/Videos
                      </label>
                      <div
                        className={styles["upload-area"]}
                        onClick={() =>
                          !uploadingPhotos &&
                          document.getElementById("photo-input").click()
                        }
                        style={{
                          cursor: uploadingPhotos ? "not-allowed" : "pointer",
                          opacity: uploadingPhotos ? 0.6 : 1,
                        }}
                      >
                        <div className={styles["upload-area-icon"]}>
                          <CiCamera size={40} />
                        </div>
                        <div className={styles["upload-area-title"]}>
                          Event Photos/Videos
                        </div>
                        <div className={styles["upload-area-subtitle"]}>
                          {uploadingPhotos
                            ? "Uploading to cloud..."
                            : "Drag and drop or click to upload"}
                        </div>
                        <input
                          id="photo-input"
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handlePhotoUpload}
                          className={styles["upload-area-input"]}
                          disabled={uploadingPhotos}
                        />
                      </div>
                      {photos.length > 0 && (
                        <div className={styles["uploaded-files"]}>
                          {photos.map((photo, idx) => (
                            <div key={idx} className={styles["file-item"]}>
                              <span className={styles["file-item-name"]}>
                                {photo.name}
                              </span>
                              <button
                                type="button"
                                className={styles["file-item-remove"]}
                                onClick={() => removePhoto(idx)}
                                disabled={uploadingPhotos}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ marginBottom: "15px", display: "block" }}>
                        Participant List (CSV)
                      </label>
                      <div
                        className={styles["upload-area"]}
                        onClick={() =>
                          document.getElementById("csv-input").click()
                        }
                      >
                        <div className={styles["upload-area-icon"]}>
                          <CiFileOn size={40} />
                        </div>
                        <div className={styles["upload-area-title"]}>
                          Participant List (CSV/Excel)
                        </div>
                        <div className={styles["upload-area-subtitle"]}>
                          Drag and drop or click to upload
                        </div>
                        <input
                          id="csv-input"
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleCSVUpload}
                          className={styles["upload-area-input"]}
                        />
                      </div>
                      {csvFile && (
                        <div
                          style={{
                            marginTop: "15px",
                            fontSize: "13px",
                            color: "#059669",
                          }}
                        >
                          ✓ {csvFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className={styles["form-actions"]}>
                  <button
                    type="button"
                    className={
                      styles["form-btn"] + " " + styles["form-btn-cancel"]
                    }
                    onClick={() => navigate("/partner/dashboard")}
                    disabled={loading || uploadingPhotos}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={
                      styles["form-btn"] + " " + styles["form-btn-submit"]
                    }
                    disabled={loading || uploadingPhotos}
                  >
                    {loading
                      ? "Submitting..."
                      : uploadingPhotos
                      ? "Uploading photos..."
                      : "Submit for Approval"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
