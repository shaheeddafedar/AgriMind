import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api, { rootApi } from "../services/api";
import "../assets/css/profile.css";

const Profile = ({ user, onUpdateUser }) => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    location: user?.location || "",
    email: user?.email || "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setCurrentUser(user);

    setFormData({
      name: user.name || "",
      location: user.location || "",
      email: user.email || "",
    });
  }, [user]);

  useEffect(() => {
    if (!user?._id) {
      setRecommendations([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await api.get(
          `/recommend/${user._id}`
        );

        if (Array.isArray(response.data)) {
          setRecommendations(response.data);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error(
          "Error fetching history:",
          error
        );

        setRecommendations([]);
      }
    };

    fetchHistory();
  }, [user?._id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    setUpdating(true);

    const submitData = new FormData();

    submitData.append(
      "name",
      formData.name
    );

    submitData.append(
      "location",
      formData.location
    );

    submitData.append(
      "email",
      formData.email
    );

    if (profilePhoto) {
      submitData.append(
        "profilePhoto",
        profilePhoto
      );
    }

    try {
      const response = await rootApi.post(
        "/profile/update",
        submitData
      );

      if (response.data?.user) {
        const updatedUser = response.data.user;

        setCurrentUser(updatedUser);

        setFormData({
          name: updatedUser.name || "",
          location: updatedUser.location || "",
          email: updatedUser.email || "",
        });

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
      } else {
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          location: formData.location,
          email: formData.email,
        };

        setCurrentUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
      }

      setProfilePhoto(null);

      alert("Profile updated successfully.");

      window.location.reload();
    } catch (error) {
      console.error(
        "Error updating profile:",
        error
      );

      alert("Error updating profile.");
    } finally {
      setUpdating(false);
    }
  };

  const getCropName = (crop) => {
    if (!crop) {
      return "";
    }

    return (
      crop.charAt(0).toUpperCase() +
      crop.slice(1).toLowerCase()
    );
  };

  const getProfileImage = () => {
    if (!currentUser?.profilePhoto) {
      return "/images/default-user.png";
    }

    if (
      currentUser.profilePhoto.startsWith("http")
    ) {
      return currentUser.profilePhoto;
    }

    return `http://localhost:3000${currentUser.profilePhoto}`;
  };

  return (
    <main className="container">
      <div className="profile-container">

        <div className="profile-card">
          <img
            src={getProfileImage()}
            alt="Profile"
            className="profile-img"
          />

          <h2>
            {currentUser?.name || ""}
          </h2>

          <p className="text-muted">
            <i className="fas fa-map-marker-alt"></i>{" "}
            {currentUser?.location || t("not_set", "Not set")}
          </p>

          <hr />

          <h3>
            {t("edit_details", "Edit Details")}
          </h3>

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                required
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="location"
                value={formData.location}
                placeholder={t("city_state", "City/State")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                required
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label
                style={{
                  fontSize: "0.8rem",
                }}
              >
                {t("change_photo", "Change Photo")}:
              </label>

              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={(e) =>
                  setProfilePhoto(
                    e.target.files?.[0] || null
                  )
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-full"
              disabled={updating}
            >
              {updating
                ? t("updating", "Updating...")
                : t("update_profile", "Update Profile")}
            </button>
          </form>
        </div>

        <div
          className="profile-card"
          style={{
            textAlign: "left",
          }}
        >
          <h3>
            <i className="fas fa-history"></i>{" "}
            {t("profile_recommendations", "Recent Recommendations")}
          </h3>

          {recommendations.length > 0 ? (
            <ul className="history-list">
              {recommendations.map((rec) => (
                <li
                  key={rec._id}
                  className="history-item"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: "1.1rem",
                        color: "#2E8B57",
                      }}
                    >
                      {getCropName(
                        rec.recommendedCrop
                      )}
                    </strong>

                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    >
                      <span>
                        <i className="fas fa-flask"></i>{" "}
                        pH: {rec.soilPh}
                      </span>

                      {" | "}

                      <span>
                        <i className="fas fa-cloud-rain"></i>{" "}
                        {rec.rainfall}mm
                      </span>
                    </div>

                    <small
                      style={{
                        color: "#888",
                      }}
                    >
                      {new Date(
                        rec.createdAt
                      ).toLocaleDateString()}
                    </small>
                  </div>

                  <a
                    href={`/recommendation/pdf/${rec._id}`}
                    className="btn-sm"
                    style={{
                      background: "#2E8B57",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      textDecoration: "none",
                    }}
                    title={t("download_report", "Download Report")}
                  >
                    <i className="fas fa-download"></i>{" "}
                    PDF
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              {t("no_recommendations", "No recommendations found yet. Go to the dashboard to get one!")}
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;