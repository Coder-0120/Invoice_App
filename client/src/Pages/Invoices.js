import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
const storedData = JSON.parse(localStorage.getItem("UserInfo"));

const userId = storedData?.userInfo?.userId || null;
  // Fetch invoices from backend
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/invoice/allmy/${userId}`, {
        });
        setInvoices(res.data.invoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const statusColors = {
    paid: '#10b981',
    unpaid: '#f59e0b',
    draft: '#6B7280',
    cancelled: '#ef4444'
  };

  const statusIcons = {
    paid: '✓',
    unpaid: '⏳',
    draft: '📝',
    cancelled: '✕'
  };

  // Filter invoices based on selected status
  const filteredInvoices = invoices.filter(inv =>
    filter === 'all' || inv.status === filter
  );

  // Calculate statistics
  const stats = {
    all: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    unpaid: invoices.filter(inv => inv.status === 'unpaid').length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    cancelled: invoices.filter(inv => inv.status === 'cancelled').length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const handleEdit = (invoiceId) => {
    window.location.href = `/invoice/edit/${invoiceId}`;
  }
  const finalize = async (invoiceId) => {
    try {
      await axios.put(`http://localhost:5000/api/invoice/finalize/${invoiceId}`);
      alert("Invoice finalized successfully");
    }
    catch (error) {
      console.log("Error finalizing invoice");
      alert("Error finalizing invoice");

    }
  }
  const markAsPaid = async (invoiceId) => {
    try {
      await axios.put(`http://localhost:5000/api/invoice/paid/${invoiceId}`);
      alert("Invoice marked as paid successfully");
    }
    catch (error) {
      alert("Error marking invoice as paid");
    }
  };
  const cancelInvoice = async (invoiceId) => {
    try {
      await axios.put(`http://localhost:5000/api/invoice/cancel/${invoiceId}`);
      alert("Invoice cancelled successfully");
    }
    catch (error) {
      alert("Error cancelling invoice");
    }
  };



  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>All Invoices</h1>
          <p style={styles.pageSubtitle}>Manage and track your invoices</p>
        </div>
        <button style={styles.createBtn} onClick={() => window.location.href = '/create-invoice'}>
          <svg style={styles.createIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </button>
      </div>

      {/* Filter Bar with Stats */}
      <div style={styles.filterBar}>
        {[
          { key: 'all', label: 'All Invoices' },
          { key: 'paid', label: 'Paid' },
          { key: 'unpaid', label: 'Unpaid' },
          { key: 'draft', label: 'Draft' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map((status) => (
          <button
            key={status.key}
            style={{
              ...styles.filterBtn,
              background: filter === status.key ? 'linear-gradient(to right, #059669, #0891b2)' : '#fff',
              color: filter === status.key ? '#fff' : '#6B7280',
              border: filter === status.key ? 'none' : '2px solid #e5e7eb',
            }}
            onClick={() => setFilter(status.key)}
          >
            <span style={styles.filterLabel}>{status.label}</span>
            <span style={{
              ...styles.filterCount,
              background: filter === status.key ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
              color: filter === status.key ? '#fff' : '#374151',
            }}>
              {stats[status.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        /* Empty State */
        <div style={styles.emptyState}>
          <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 style={styles.emptyTitle}>No invoices yet</h3>
          <p style={styles.emptyText}>Create your first invoice to get started</p>
          <button style={styles.emptyBtn} onClick={() => window.location.href = '/create-invoice'}>
            <svg style={styles.createIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </button>
        </div>
      ) : filteredInvoices.length === 0 ? (
        /* No Results for Filter */
        <div style={styles.emptyState}>
          <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 style={styles.emptyTitle}>No {filter} invoices</h3>
          <p style={styles.emptyText}>Try selecting a different filter</p>
        </div>
      ) : (
        /* Desktop Table View */
        <>
          <div style={styles.tableContainer} className="invoice-desktop-table">
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Invoice #</th>
                  <th style={styles.th}>Client</th>
                  <th style={styles.th}>Date</th>
                  {/* <th style={styles.th}>Due Date</th> */}
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={styles.invoiceNumber}>{invoice.invoiceNumber}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.clientInfo}>
                        <span style={styles.clientName}>{invoice.customer.name}</span>
                        <span style={styles.clientEmail}>{invoice.clientEmail}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{formatDate(invoice.invoiceDate)}</td>
                    {/* <td style={styles.td}>{formatDate(invoice.dueDate)}</td> */}
                    <td style={styles.td}>
                      <span style={styles.amount}>{(invoice.grandTotal)}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: `${statusColors[invoice.status]}20`,
                        color: statusColors[invoice.status],
                        border: `1px solid ${statusColors[invoice.status]}40`,
                      }}>
                        <span style={styles.statusIcon}>{statusIcons[invoice.status]}</span>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button style={styles.viewBtn} title="View Invoice" onClick={() => navigate(`/invoice/view/${invoice._id}`)}>
                          <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {invoice.status === "draft" && (
                          <>
                          <button style={styles.editBtn} title="Edit Invoice" disabled={invoice.status !== "draft"} onClick={() => handleEdit(invoice._id)}>
                            <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                           <button style={styles.finalizeBtn} title="Finalize Invoice" disabled={invoice.status !== "draft"} onClick={() => finalize(invoice._id)}>
                          <svg style={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                          </>
                        )}

                        {invoice.status === "unpaid" && (
                          <>
                            
                            <button style={styles.cancelbtn} title="Cancel Invoice" onClick={() => cancelInvoice(invoice._id)}>
                              <svg style={styles.cancelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22a10 10 0 100-20 10 10 0 000 20zM15 9l-6 6M9 9l6 6" />
                              </svg>
                            </button>
                            <button title="Mark as Paid" disabled={invoice.status !== "unpaid"} onClick={() => markAsPaid(invoice._id)} >
                              <svg style={styles.paidIcon} viewBox="0 0 24 24" fill="white" stroke="green" >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z"/>
                              </svg>
                            </button>
                          

                          </>

                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div style={styles.mobileCards} className="invoice-mobile-cards">
            {filteredInvoices.map((invoice, index) => (
              <div key={index} style={styles.mobileCard}>
                <div style={styles.mobileCardHeader}>
                  <div>
                    <span style={styles.mobileInvoiceNumber}>{invoice.invoiceNumber}</span>
                    <span style={{
                      ...styles.mobileStatus,
                      background: `${statusColors[invoice.status]}20`,
                      color: statusColors[invoice.status],
                      border: `1px solid ${statusColors[invoice.status]}40`,
                    }}>
                      {statusIcons[invoice.status]} {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <span style={styles.mobileAmount}>{(invoice.grandTotal)}</span>
                </div>

                <div style={styles.mobileCardBody}>
                  <div style={styles.mobileRow}>
                    <span style={styles.mobileLabel}>Client:</span>
                    <span style={styles.mobileValue}>{invoice.customer.name}</span>
                  </div>
                  <div style={styles.mobileRow}>
                    <span style={styles.mobileLabel}>Date:</span>
                    <span style={styles.mobileValue}>{formatDate(invoice.invoiceDate)}</span>
                  </div>
                </div>

                <div style={styles.mobileCardFooter}>
                  <button style={styles.mobileViewBtn} onClick={() => navigate(`/invoice/view/${invoice._id}`)}>View Details</button>
                  <div style={styles.mobileActions}>
                    {invoice.status === "draft" && (
                      <button style={styles.mobileEditBtn} onClick={() => handleEdit(invoice._id)}>Edit</button>
                    )}
                    {invoice.status === "unpaid" && (
                      <button style={styles.mobileEditBtn} onClick={() => cancelInvoice(invoice._id)}>Cancelled</button>
                    )}
                    {invoice.status === "draft" && (
                      <button style={styles.mobileEditBtn} onClick={() => finalize(invoice._id)}>Finalize</button>
                    )}
                    {invoice.status === "unpaid" && (
                      <button style={styles.mobileEditBtn} onClick={() => markAsPaid(invoice._id)}>Mark as Paid</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  paidBtn: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  paidIcon: {
    width: "20px",
    height: "20px",
  },

  // Optional hover effect
  paidBtnHover: {
    background: "#bbf7d0",
    transform: "scale(1.05)",
  }
  ,
  pageContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '8px',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6B7280',
    margin: '8px 0 0 0',
  },
  createBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(to right, #059669, #0891b2)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
  },
  createIcon: {
    width: '18px',
    height: '18px',
  },
  cancelIcon: {
    width: '16px',
    height: '16px',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    whiteSpace: 'nowrap',
  },
  filterCount: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '24px',
    textAlign: 'center',
  },
  loadingState: {
    background: '#fff',
    padding: '64px 24px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto 16px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #059669',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '16px',
    color: '#6B7280',
  },
  emptyState: {
    background: '#fff',
    padding: '64px 24px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    color: '#D1D5DB',
    margin: '0 auto 16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1F2937',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '16px',
    color: '#6B7280',
    margin: '0 0 24px 0',
  },
  emptyBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(to right, #059669, #0891b2)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  tableContainer: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px',
  },
  tableHeader: {
    background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#1F2937',
  },
  invoiceNumber: {
    fontWeight: '600',
    color: '#059669',
  },
  clientInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  clientName: {
    fontWeight: '500',
    color: '#1F2937',
  },
  clientEmail: {
    fontSize: '12px',
    color: '#6B7280',
  },
  amount: {
    fontWeight: '600',
    color: '#1F2937',
    fontSize: '15px',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusIcon: {
    fontSize: '12px',
  },
  actionBtns: {
    display: 'flex',
    gap: '8px',
  },
  viewBtn: {
    padding: '8px',
    background: '#f0fdf4',
    color: '#059669',
    border: '1px solid #d1fae5',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  editBtn: {
    padding: '8px',
    background: '#eff6ff',
    color: '#0891b2',
    border: '1px solid #dbeafe',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    padding: '8px',
    background: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelbtn: {
    padding: '8px',
    background: '#fef2f2',
    color: '#ef4444',
  },
  actionIcon: {
    width: '16px',
    height: '16px',
  },
  mobileCards: {
    display: 'none',
  },
  mobileCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid grey',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  mobileCardHeader: {
    padding: '16px',
    background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
    borderBottom: '1px solid #e5e7eb',
  },
  mobileInvoiceNumber: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#059669',
    display: 'block',
    marginBottom: '8px',
  },
  mobileStatus: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
  },
  mobileAmount: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1F2937',
    display: 'block',
    marginTop: '8px',
  },
  mobileCardBody: {
    padding: '16px',
  },
  mobileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  mobileLabel: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500',
  },
  mobileValue: {
    fontSize: '14px',
    color: '#1F2937',
    fontWeight: '500',
    textAlign: 'right',
  },
  mobileCardFooter: {
    padding: '16px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    gap: '8px',
    flexDirection: 'column',
  },
  mobileViewBtn: {
    padding: '10px',
    background: 'linear-gradient(to right, #059669, #0891b2)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  mobileActions: {
    display: 'flex',
    gap: '8px',
  },
  mobileEditBtn: {
    flex: 1,
    padding: '8px',
    background: '#eff6ff',
    color: '#0891b2',
    border: '1px solid #dbeafe',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  mobileDeleteBtn: {
    flex: 1,
    padding: '8px',
    background: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

// Add CSS for animations and responsive design
if (typeof window !== 'undefined' && !document.getElementById('invoices-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'invoices-styles';
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .invoice-desktop-table tbody tr:hover {
      background: #f9fafb;
    }
    
    @media (max-width: 768px) {
      .invoice-desktop-table {
        display: none !important;
      }
      
      .invoice-mobile-cards {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Invoices;