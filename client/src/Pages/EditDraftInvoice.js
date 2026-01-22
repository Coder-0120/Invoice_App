import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, User, Package, Plus, Trash2, Save, X } from 'lucide-react';

const EditDraftInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "" // Added address field
  });

  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ================= FETCH INVOICE =================
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/invoice/my/${id}`);

        if (res.data.invoice.status !== "draft") {
          alert("Only draft invoices can be edited");
          navigate("/invoices");
          return;
        }

        setCustomer(res.data.invoice.customer);
        setItems(res.data.invoice.items);
        setLoading(false);
      } catch (error) {
        alert("Failed to load invoice");
        navigate("/invoices");
      }
    };

    fetchInvoice();
  }, [id, navigate]);


  // ================= ITEM UPDATE =================
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { itemName: "", price: 0, quantity: 1 }
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
    }
  };

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};
    
    if (!customer.name.trim()) newErrors.customerName = 'Required';
    
    items.forEach((item, index) => {
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

  // ================= UPDATE DRAFT =================
  const updateDraftInvoice = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/invoice/${id}`, {
        customer,
        items
      });

      alert("Draft invoice updated successfully");
      navigate("/invoices");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigate("/invoices");
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  if (loading) return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <p style={styles.loading}>Loading invoice...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <FileText size={40} color="#059669" />
          <h1 style={styles.title}>Edit Draft Invoice</h1>
          <p style={styles.subtitle}>Update invoice details before finalizing</p>
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
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Enter customer name"
                />
                {errors.customerName && <span style={styles.error}>{errors.customerName}</span>}
              </div>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Phone</label>
                  <input
                    style={styles.input}
                    value={customer.phone || ''}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={customer.email || ''}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
              </div>

              {/* ADDRESS FIELD - NEW */}
              <div style={styles.field}>
                <label style={styles.label}>Address</label>
                <textarea
                  style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
                  value={customer.address || ''}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Enter customer address"
                />
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
              {items.map((item, index) => (
                <div key={index} style={styles.itemCard}>
                  <div style={styles.itemHeader}>
                    <span style={styles.itemNum}>Item #{index + 1}</span>
                    {items.length > 1 && (
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
                      onChange={(e) => updateItem(index, 'itemName', e.target.value)}
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
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
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
                        onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
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
              onClick={updateDraftInvoice} 
              style={saving ? styles.saveBtnDisabled : styles.saveBtn}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={handleCancel} 
              style={styles.cancelBtn}
              disabled={saving}
            >
              <X size={18} />
              Cancel
            </button>
          </div>

          {/* Rest of your code for Items, Summary, and Buttons remains the same... */}
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
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#64748b',
    padding: '40px'
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
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
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
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  cancelBtn: {
    padding: '14px 24px',
    background: '#fff',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};
export default EditDraftInvoice;