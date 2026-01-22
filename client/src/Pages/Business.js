import React, { useEffect, useState } from 'react';
import { Building2, User, Phone, FileText, MapPin, Percent } from 'lucide-react';
import axios from 'axios';

const Business = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessOwner: '',
    Address: '',
    contactNo: '',
    gstNumber: '',
    cgst: '',
    sgst: ''
  });

  const [errors, setErrors] = useState({});
  const [isBusinessCreated, setIsBusinessCreated] = useState(false);

  const storedData = JSON.parse(localStorage.getItem("UserInfo"));
  const userId = storedData?.userInfo?.userId || null;

  // 🔹 Fetch business once
  useEffect(() => {
    if (!userId) return;

    const fetchBusiness = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/business/my/${userId}`
        );

        if (res.data?.business) {
          const b = res.data.business;

          setFormData({
            businessName: b.businessName,
            businessOwner: b.businessOwner,
            Address: b.Address,
            contactNo: b.contactNo,
            gstNumber: b.gstNumber,
            cgst: b.tax?.cgst ?? '',
            sgst: b.tax?.sgst ?? ''
          });

          setIsBusinessCreated(true);
        }
      } catch (err) {
        setIsBusinessCreated(false); // new user
      }
    };

    fetchBusiness();
  }, [userId]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) newErrors.businessName = 'Required';
    if (!formData.businessOwner.trim()) newErrors.businessOwner = 'Required';
    if (!formData.Address.trim()) newErrors.Address = 'Required';

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Required';
    } else if (!/^[0-9]{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Must be 10 digits';
    }

    if (!isBusinessCreated && !formData.gstNumber.trim()) {
      newErrors.gstNumber = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        userId,
        businessName: formData.businessName,
        businessOwner: formData.businessOwner,
        Address: formData.Address,
        contactNo: formData.contactNo,
        tax: {
          cgst: Number(formData.cgst) || 0,
          sgst: Number(formData.sgst) || 0
        }
      };

      let res;

      if (isBusinessCreated) {
        // 🔄 UPDATE (GST not allowed)
        res = await axios.put(
          `http://localhost:5000/api/business/update/${userId}`,
          payload
        );
      } else {
        // 🆕 CREATE
        res = await axios.post(
          "http://localhost:5000/api/business/create",
          { ...payload, gstNumber: formData.gstNumber }
        );
      }

      alert(res.data.message);
      setIsBusinessCreated(true);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleReset = () => {
    if (isBusinessCreated) return;

    setFormData({
      businessName: '',
      businessOwner: '',
      Address: '',
      contactNo: '',
      gstNumber: '',
      cgst: '',
      sgst: ''
    });
    setErrors({});
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Building2 size={40} color="#059669" />
          <h1 style={styles.title}>Business Profile</h1>
          <p style={styles.subtitle}>Manage your business information and tax settings</p>
        </div>

        <div style={styles.layout}>
          {/* Basic Information */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Building2 size={20} color="#059669" />
              <h3 style={styles.cardTitle}>Basic Information</h3>
            </div>
            
            <div style={styles.cardBody}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    <Building2 size={16} style={{marginRight: 6}} />
                    Business Name *
                  </label>
                  <input
                    style={errors.businessName ? styles.inputError : styles.input}
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder="Enter business name"
                  />
                  {errors.businessName && <span style={styles.error}>{errors.businessName}</span>}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    <User size={16} style={{marginRight: 6}} />
                    Business Owner *
                  </label>
                  <input
                    style={errors.businessOwner ? styles.inputError : styles.input}
                    value={formData.businessOwner}
                    onChange={(e) => handleChange('businessOwner', e.target.value)}
                    placeholder="Enter owner name"
                  />
                  {errors.businessOwner && <span style={styles.error}>{errors.businessOwner}</span>}
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  <MapPin size={16} style={{marginRight: 6}} />
                  Business Address *
                </label>
                <textarea
                  rows="3"
                  style={errors.Address ? styles.textareaError : styles.textarea}
                  value={formData.Address}
                  onChange={(e) => handleChange('Address', e.target.value)}
                  placeholder="Enter complete business address"
                />
                {errors.Address && <span style={styles.error}>{errors.Address}</span>}
              </div>
            </div>
          </div>

          {/* Contact & GST */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FileText size={20} color="#059669" />
              <h3 style={styles.cardTitle}>Contact & Tax Details</h3>
            </div>
            
            <div style={styles.cardBody}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    <Phone size={16} style={{marginRight: 6}} />
                    Contact Number *
                  </label>
                  <input
                    style={errors.contactNo ? styles.inputError : styles.input}
                    value={formData.contactNo}
                    onChange={(e) => handleChange('contactNo', e.target.value)}
                    placeholder="10 digit mobile number"
                  />
                  {errors.contactNo && <span style={styles.error}>{errors.contactNo}</span>}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    <FileText size={16} style={{marginRight: 6}} />
                    GST Number *
                  </label>
                  <input
                    style={errors.gstNumber ? styles.inputError : styles.input}
                    value={formData.gstNumber}
                    disabled={isBusinessCreated}
                    onChange={(e) => handleChange('gstNumber', e.target.value)}
                    placeholder="Enter GST number"
                  />
                  {errors.gstNumber && <span style={styles.error}>{errors.gstNumber}</span>}
                  {isBusinessCreated && (
                    <span style={styles.infoText}>
                      GST number cannot be changed once saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tax Settings */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Percent size={20} color="#059669" />
              <h3 style={styles.cardTitle}>Tax Configuration</h3>
            </div>
            
            <div style={styles.cardBody}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    <Percent size={16} style={{marginRight: 6}} />
                    CGST (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    style={styles.input}
                    value={formData.cgst}
                    onChange={(e) => handleChange('cgst', e.target.value)}
                    placeholder="e.g., 9"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    <Percent size={16} style={{marginRight: 6}} />
                    SGST (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    style={styles.input}
                    value={formData.sgst}
                    onChange={(e) => handleChange('sgst', e.target.value)}
                    placeholder="e.g., 9"
                  />
                </div>
              </div>

              {/* <div style={styles.taxNote}>
                <p style={styles.noteText}>
                  💡 These tax rates will be applied to all invoices by default. Total GST = CGST + SGST
                </p>
              </div> */}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttons}>
            <button onClick={handleSubmit} style={styles.saveBtn}>
              {isBusinessCreated ? "Update Business Profile" : "Save Business Profile"}
            </button>

            {!isBusinessCreated && (
              <button onClick={handleReset} style={styles.resetBtn}>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#f1f5f9',
    padding: '24px',
    fontFamily: 'system-ui, sans-serif'
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },
  layout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '16px 24px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  cardBody: {
    padding: '24px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  inputError: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    outline: 'none'
  },
  textarea: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.2s'
  },
  textareaError: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  error: {
    fontSize: '13px',
    color: '#ef4444',
    fontWeight: '500'
  },
  infoText: {
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic'
  },
  taxNote: {
    padding: '16px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    marginTop: '12px'
  },
  noteText: {
    fontSize: '14px',
    color: '#166534',
    margin: 0,
    lineHeight: '1.6'
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  saveBtn: {
    flex: 1,
    padding: '14px',
    background: '#059669',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  resetBtn: {
    padding: '14px 32px',
    background: '#fff',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default Business;