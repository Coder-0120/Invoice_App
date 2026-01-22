import React, { useState } from 'react';
import { FileText, User, Package, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const CreateInvoice = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    items: [{ itemName: '', quantity: 1, price: 0 }]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) newErrors.customerName = 'Required';
    
    formData.items.forEach((item, index) => {
      if (!item.itemName.trim()) {
        newErrors[`item_${index}_name`] = 'Required';
      }
      if (item.quantity < 1) {
        newErrors[`item_${index}_qty`] = 'Min 1';
      }
      if (item.price <= 0) {
        newErrors[`item_${index}_price`] = 'Must be > 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // Get userId from localStorage - adjust this based on your auth structure
const storedData = JSON.parse(localStorage.getItem("UserInfo"));

const userId = storedData?.userInfo?.userId || null;

      if (!userId) {
        alert('Please login first');
        setLoading(false);
        return;
      }

      // Make API call
      const response = await axios.post('http://localhost:5000/api/invoice/create', {
          userId: userId,
          customer: {
            name: formData.customerName,
            phone: formData.customerPhone,
            email: formData.customerEmail,
            address: formData.customerAddress

          },
          items: formData.items
        });

      const data = await response.data;

      if (response.status === 201 || response.status === 200) {
        alert(data.message || 'Invoice created successfully!');
        handleReset();
      } else {
        alert(data.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert("business details not filled");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      items: [{ itemName: '', quantity: 1, price: 0 }]
    });
    setErrors({});
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <FileText size={40} color="#059669" />
          <h1 style={styles.title}>Create Invoice</h1>
        </div>

        <div style={styles.layout}>
          {/* Customer Details */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <User size={20} color="#059669" />
              <h3 style={styles.cardTitle}>Customer Details</h3>
            </div>
            
            <div style={styles.cardBody}>
              <div style={styles.field}>
                <label style={styles.label}>Customer Name *</label>
                <input
                  style={errors.customerName ? styles.inputError : styles.input}
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                />
                {errors.customerName && <span style={styles.error}>{errors.customerName}</span>}
              </div>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Phone</label>
                  <input
                    style={styles.input}
                    value={formData.customerPhone}
                    onChange={(e) => handleChange('customerPhone', e.target.value)}
                    placeholder="Phone number"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={formData.customerEmail}
                    onChange={(e) => handleChange('customerEmail', e.target.value)}
                    placeholder="Email address"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Address</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={formData.customerAddress}
                    onChange={(e) => handleChange('customerAddress', e.target.value)}
                    placeholder="Customer address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Package size={20} color="#059669" />
              <h3 style={styles.cardTitle}>Items</h3>
            </div>
            
            <div style={styles.cardBody}>
              {formData.items.map((item, index) => (
                <div key={index} style={styles.itemCard}>
                  <div style={styles.itemHeader}>
                    <span style={styles.itemNum}>Item #{index + 1}</span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        style={styles.removeBtn}
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Item Name *</label>
                    <input
                      style={errors[`item_${index}_name`] ? styles.inputError : styles.input}
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      placeholder="Enter item name"
                    />
                    {errors[`item_${index}_name`] && <span style={styles.error}>{errors[`item_${index}_name`]}</span>}
                  </div>

                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        style={errors[`item_${index}_qty`] ? styles.inputError : styles.input}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      />
                      {errors[`item_${index}_qty`] && <span style={styles.error}>{errors[`item_${index}_qty`]}</span>}
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Price *</label>
                      <input
                        type="number"
                        min="0"
                        style={errors[`item_${index}_price`] ? styles.inputError : styles.input}
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                      />
                      {errors[`item_${index}_price`] && <span style={styles.error}>{errors[`item_${index}_price`]}</span>}
                    </div>
                  </div>

                  <div style={styles.itemTotal}>
                    <span>Amount:</span>
                    <span style={styles.amount}>₹{(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <button type="button" style={styles.addBtn} onClick={addItem}>
                <Plus size={18} />
                Add Item
              </button>
            </div>
          </div>

          {/* Summary */}
          <div style={styles.card}>
            <div style={styles.cardBody}>
              <div style={styles.summary}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Subtotal:</span>
                  <span style={styles.summaryValue}>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <p style={styles.note}>Tax will be calculated based on your business settings</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={styles.buttons}>
            <button 
              onClick={handleSubmit} 
              style={loading ? styles.saveBtnDisabled : styles.saveBtn}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
            <button 
              onClick={handleReset} 
              style={styles.resetBtn}
              disabled={loading}
            >
              Reset
            </button>
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
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '8px 0'
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
    padding: '16px 20px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  cardBody: {
    padding: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155'
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none'
  },
  inputError: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    outline: 'none'
  },
  error: {
    fontSize: '13px',
    color: '#ef4444'
  },
  itemCard: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #e2e8f0'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  itemNum: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#059669'
  },
  removeBtn: {
    padding: '6px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  itemTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '12px',
    marginTop: '12px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '600'
  },
  amount: {
    color: '#059669'
  },
  addBtn: {
    width: '100%',
    padding: '12px',
    background: '#059669',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  summary: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  summaryLabel: {
    color: '#64748b'
  },
  summaryValue: {
    color: '#059669'
  },
  note: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    fontStyle: 'italic'
  },
  buttons: {
    display: 'flex',
    gap: '12px'
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
    cursor: 'pointer'
  },
  saveBtnDisabled: {
    flex: 1,
    padding: '14px',
    background: '#94a3b8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  resetBtn: {
    padding: '14px 24px',
    background: '#fff',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default CreateInvoice;