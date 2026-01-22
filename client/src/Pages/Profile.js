import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const storedData = JSON.parse(localStorage.getItem("UserInfo"));
  const userId = storedData?.userInfo?.userId || null;

  useEffect(() => {
    console.log("Fetching profile for userId:", userId);
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/profile/${userId}`);
        setProfileData({ ...profileData, name: res.data.user.name, email: res.data.user.email });

      }
      catch (error) {
        console.log(error);
      }
    }
    fetchProfile();


  }, [userId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/user/update/${userId}`, {
        name: profileData.name
      });
      alert("Profile updated successfully");
      const existingData = JSON.parse(localStorage.getItem("UserInfo"));

      localStorage.setItem(
        "UserInfo",
        JSON.stringify({
          ...existingData,
          userInfo: {
            ...existingData.userInfo,
            name: profileData.name,
          },
        })
      );

    }
    catch (error) {
      console.log(error);
      alert("Error in updating profile");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Profile Settings</h1>
      <p style={styles.pageSubtitle}>Manage your account information</p>

      {/* Profile Information */}
      <form onSubmit={handleUpdateProfile} style={styles.form}>
        <div style={styles.formSection}>
          <h3 style={styles.formSectionTitle}>Profile Information</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                required
                style={styles.input}
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                required
                style={styles.input}
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
          </div>
          <button type="submit" style={styles.submitBtn}>
            Update Profile
          </button>
        </div>
      </form>

     
    </div>
  );
};

const styles = {
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6B7280',
    marginBottom: '32px',
  },
  form: {
    background: '#fff',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  formSection: {
    marginBottom: 0,
  },
  formSectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '16px',
    marginTop: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(to right, #059669, #0891b2)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '16px',
    transition: 'transform 0.2s',
  },
};

export default Profile;