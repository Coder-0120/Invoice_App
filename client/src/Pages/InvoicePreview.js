import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Mail, Phone, MapPin, Calendar, Download, Printer, Edit, ArrowLeft } from 'lucide-react';

const InvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/invoice/my/${id}`);
        setInvoice(res.data.invoice);
        setLoading(false);
      } catch (error) {
        alert('Failed to load invoice');
        navigate('/invoices');
      }
    };

    fetchInvoice();
  }, [id, navigate]);

  const getStatusBadge = (status) => {
    const styles = {
      paid: { background: '#d1fae5', color: '#065f46', text: 'Paid' },
      unpaid: { background: '#fef3c7', color: '#92400e', text: 'Unpaid' },
      draft: { background: '#dbeafe', color: '#1e40af', text: 'Draft' },
      cancelled: { background: '#fee2e2', color: '#991b1b', text: 'Cancelled' }
    };
    return styles[status] || styles.draft;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/invoice/download/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download invoice');
    }
  };

  const handleEdit = () => {
    navigate(`/invoice/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/invoices');
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <p style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <p style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>Invoice not found</p>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(invoice.status);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Action Bar */}
        <div style={styles.actionBar} className="no-print">
          <button style={styles.backBtn} onClick={handleBack}>
            <ArrowLeft size={18} />
            Back
          </button>
          <div style={styles.actions}>
            {invoice.status === 'draft' && (
              <button style={styles.editBtn} onClick={handleEdit}>
                <Edit size={18} />
                Edit
              </button>
            )}
            <button style={styles.downloadBtn} onClick={() => handleDownload(invoice._id)}>
              <Download size={18} />
              Download
            </button>
            <button style={styles.printBtn} onClick={handlePrint}>
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div style={styles.invoice}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <div style={styles.logoSection}>
                <FileText size={48} color="#059669" />
                <div>
                  <h1 style={styles.businessName}>{invoice.businessSnapshot.businessName}</h1>
                  <p style={styles.businessOwner}>{invoice.businessSnapshot.businessOwner}</p>
                </div>
              </div>
            </div>
            <div style={styles.invoiceTitle}>
              <h2 style={styles.invoiceText}>INVOICE</h2>
              <p style={styles.invoiceNumber}>{invoice.invoiceNumber || 'DRAFT'}</p>
              <span style={{...styles.statusBadge, background: statusBadge.background, color: statusBadge.color}}>
                {statusBadge.text}
              </span>
            </div>
          </div>

          {/* Business & Customer Info */}
          <div style={styles.infoSection}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>From</h3>
              <p style={styles.infoText}><strong>{invoice.businessSnapshot.businessName}</strong></p>
              <p style={styles.infoText}><MapPin size={14} style={{marginRight: 6}} />{invoice.businessSnapshot.address}</p>
              <p style={styles.infoText}><Phone size={14} style={{marginRight: 6}} />{invoice.businessSnapshot.contactNo}</p>
              {invoice.businessSnapshot.gstNumber && (
                <p style={styles.infoText}>GST: {invoice.businessSnapshot.gstNumber}</p>
              )}
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Bill To</h3>
              <p style={styles.infoText}><strong>{invoice.customer.name}</strong></p>
              {invoice.customer.address && (
                <p style={styles.infoText}><MapPin size={14} style={{marginRight: 6}} />{invoice.customer.address}</p>
              )}
              {invoice.customer.phone && (
                <p style={styles.infoText}><Phone size={14} style={{marginRight: 6}} />{invoice.customer.phone}</p>
              )}
              {invoice.customer.email && (
                <p style={styles.infoText}><Mail size={14} style={{marginRight: 6}} />{invoice.customer.email}</p>
              )}
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Invoice Details</h3>
              <p style={styles.infoText}>
                <Calendar size={14} style={{marginRight: 6}} />
                <strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{...styles.th, textAlign: 'left'}}>Item</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>CGST</th>
                  <th style={styles.th}>SGST</th>
                  <th style={{...styles.th, textAlign: 'right'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} style={styles.tableRow}>
                    <td style={{...styles.td, fontWeight: '500'}}>{item.itemName}</td>
                    <td style={{...styles.td, textAlign: 'center'}}>{item.quantity}</td>
                    <td style={{...styles.td, textAlign: 'center'}}>₹{item.price.toLocaleString()}</td>
                    <td style={{...styles.td, textAlign: 'center'}}>{item.tax.cgst}%</td>
                    <td style={{...styles.td, textAlign: 'center'}}>{item.tax.sgst}%</td>
                    <td style={{...styles.td, textAlign: 'right', fontWeight: '600'}}>₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={styles.totalsSection}>
            <div style={styles.totalsCard}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Subtotal:</span>
                <span style={styles.totalValue}>₹{invoice.subTotal.toLocaleString()}</span>
              </div>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Tax Amount:</span>
                <span style={styles.totalValue}>₹{invoice.taxAmount.toLocaleString()}</span>
              </div>
              <div style={{...styles.totalRow, ...styles.grandTotalRow}}>
                <span style={styles.grandTotalLabel}>Grand Total:</span>
                <span style={styles.grandTotalValue}>₹{invoice.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>Thank you for your business!</p>
            <p style={styles.footerNote}>This is a computer-generated invoice</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
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
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  backBtn: {
    padding: '10px 20px',
    background: '#fff',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  editBtn: {
    padding: '10px 20px',
    background: '#0891b2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  downloadBtn: {
    padding: '10px 20px',
    background: '#059669',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  printBtn: {
    padding: '10px 20px',
    background: '#fff',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  invoice: {
    background: '#fff',
    padding: '48px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '40px',
    paddingBottom: '24px',
    borderBottom: '2px solid #e2e8f0'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  businessName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  businessOwner: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  invoiceTitle: {
    textAlign: 'right'
  },
  invoiceText: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  invoiceNumber: {
    fontSize: '16px',
    color: '#64748b',
    margin: '0 0 12px 0'
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'inline-block'
  },
  infoSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  infoCard: {
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 12px 0'
  },
  infoText: {
    fontSize: '14px',
    color: '#334155',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center'
  },
  tableContainer: {
    marginBottom: '32px',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0'
  },
  th: {
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0'
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#334155'
  },
  totalsSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '32px'
  },
  totalsCard: {
    width: '300px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0'
  },
  totalLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  totalValue: {
    fontSize: '14px',
    color: '#334155',
    fontWeight: '600'
  },
  grandTotalRow: {
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '2px solid #059669',
    borderBottom: 'none'
  },
  grandTotalLabel: {
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '700'
  },
  grandTotalValue: {
    fontSize: '20px',
    color: '#059669',
    fontWeight: '700'
  },
  footer: {
    textAlign: 'center',
    paddingTop: '24px',
    borderTop: '2px solid #e2e8f0'
  },
  footerText: {
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  footerNote: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0
  }
};

export default InvoicePreview;