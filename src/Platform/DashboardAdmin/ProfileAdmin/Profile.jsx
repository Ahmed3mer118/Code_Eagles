import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../Users/Context/Context";
import { toast, ToastContainer } from "react-toastify";
import { Helmet } from "react-helmet-async";

function ProfileAdmin() {
  const [profileAdmin, setProfileAdmin] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [isEditing, setIsEditing] = useState(false); 
  const { URLAPI, getTokenAdmin } = useContext(DataContext);

  // جلب بيانات الملف الشخصي
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${URLAPI}/api/users`, {
          headers: { Authorization: getTokenAdmin },
        });
        setProfileAdmin(res.data); // 
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchProfile();
  }, [URLAPI, getTokenAdmin]);

  // معالجة تحديث البيانات
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        name: profileAdmin.name,
        phone_number: profileAdmin.phone_number,
      };
      await axios.put(`${URLAPI}/api/users`, updatedData, {
        headers: { Authorization: getTokenAdmin },
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false); // الخروج من وضع التعديل
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <svg
          className="loading"
          viewBox="25 25 50 50"
          style={{ width: "3.25em" }}
        >
          <circle r="20" cy="50" cx="50"></circle>
        </svg>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-3">
      <ToastContainer />
      <Helmet>
        <title>Code Eagles | Admin Profile</title>
      </Helmet>
      <h1 className="text-center mb-4">Admin Profile</h1>
      {profileAdmin && (
        <div className="card shadow-sm p-4">
          <div className="card-body">
            {!isEditing ? (
              <>
                <p>
                  <strong>Name : </strong> {profileAdmin.name}
                </p>
                <p>
                  <strong>Phone Number : </strong> {profileAdmin.phone_number}
                </p>
                <p>
                  <strong>Email : </strong> {profileAdmin.email}
                </p>
                <p>
                  <strong>Role : </strong> {profileAdmin.role}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdate}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    value={profileAdmin.name}
                    onChange={(e) =>
                      setProfileAdmin({ ...profileAdmin, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone_number" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone_number"
                    className="form-control"
                    value={profileAdmin.phone_number}
                    onChange={(e) =>
                      setProfileAdmin({
                        ...profileAdmin,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="text"
                    id="email"
                    className="form-control"
                    value={profileAdmin.email}
                    onChange={(e) =>
                      setProfileAdmin({
                        ...profileAdmin,
                        email: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>
                <button type="submit" className="btn btn-success me-2">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      <button className="btn btn-outline-info m-3">Logout</button>
    </div>
  );
}

export default ProfileAdmin;
