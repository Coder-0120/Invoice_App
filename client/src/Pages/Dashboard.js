import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FileText, DollarSign, Clock, XCircle, Edit } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
const storedData = JSON.parse(localStorage.getItem("UserInfo"));

const userId = storedData?.userInfo?.userId || null;
  
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paid: 0,
    unpaid: 0,
    draft: 0,
    cancelled: 0
  });

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsRes = await axios.get(`http://localhost:5000/api/dashboard/stats/${userId}`);
        setStats(statsRes.data);

        // Fetch recent invoices (last 5)
        const invoicesRes = await axios.get(`http://localhost:5000/api/invoice/allmy/${userId}?limit=5`);
        setRecentInvoices(invoicesRes.data.invoices);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartData = [
    { name: 'Paid', value: stats.paid, color: '#059669' },
    { name: 'Unpaid', value: stats.unpaid, color: '#f59e0b' },
    { name: 'Draft', value: stats.draft, color: '#0891b2' },
    { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' }
  ];

  const statCards = [
    { label: 'Total Invoices', value: stats.totalInvoices, icon: FileText, color: '#6366f1' },
    { label: 'Paid', value: stats.paid, icon: DollarSign, color: '#059669' },
    { label: 'Unpaid', value: stats.unpaid, icon: Clock, color: '#f59e0b' },
    { label: 'Draft', value: stats.draft, icon: Edit, color: '#0891b2' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: '#ef4444' }
  ];

  const getStatusStyle = (status) => {
    const styles = {
      paid: { background: '#d1fae5', color: '#065f46' },
      unpaid: { background: '#fef3c7', color: '#92400e' },
      draft: { background: '#dbeafe', color: '#1e40af' },
      cancelled: { background: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || styles.draft;
  };

  const handleInvoiceClick = (invoiceId) => {
    navigate(`/invoice/${invoiceId}`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Welcome back! Here's your invoice overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={styles.statCard}>
              <div style={{...styles.iconBox, background: `${stat.color}15`}}>
                <Icon size={24} color={stat.color} />
              </div>
              <div>
                <p style={styles.statLabel}>{stat.label}</p>
                <h3 style={{...styles.statValue, color: stat.color}}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      {stats.totalInvoices > 0 && (
        <div style={styles.chartSection}>
          <div style={styles.chartCard}>
            <h2 style={styles.sectionTitle}>Invoice Status Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Invoices */}
      <div style={styles.recentSection}>
        <h2 style={styles.sectionTitle}>Recent Invoices</h2>
        {recentInvoices.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No invoices yet. Create your first invoice!</p>
          </div>
        ) : (
          <div style={styles.invoiceList}>
            {recentInvoices.map((invoice) => (
              <div 
                key={invoice._id} 
                style={styles.invoiceCard}
                onClick={() => handleInvoiceClick(invoice._id)}
              >
                <div style={styles.invoiceInfo}>
                  <div>
                    <h4 style={styles.invoiceNumber}>
                      {invoice.invoiceNumber || 'Draft'}
                    </h4>
                    <p style={styles.customerName}>{invoice.customer.name}</p>
                  </div>
                  <div style={styles.invoiceRight}>
                    <p style={styles.amount}>₹{invoice.grandTotal.toLocaleString()}</p>
                    <span style={{...styles.status, ...getStatusStyle(invoice.status)}}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                </div>
                <p style={styles.date}>
                  {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, sans-serif',
    background: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 4px 0',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0
  },
  chartSection: {
    marginBottom: '32px'
  },
  chartCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px',
    margin: '0 0 20px 0'
  },
  recentSection: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  invoiceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  invoiceCard: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    transition: 'border-color 0.2s, background 0.2s',
    cursor: 'pointer'
  },
  invoiceInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  invoiceNumber: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  customerName: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  invoiceRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end'
  },
  amount: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  status: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  date: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0
  },
  emptyState: {
    padding: '64px 24px',
    textAlign: 'center'
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b'
  }
};

export default Dashboard;