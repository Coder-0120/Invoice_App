import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import Login from './Pages/Login';
import Register_User from './Pages/Register_User';
import Dashboard from './Pages/Dashboard';
import CreateInvoice from './Pages/CreateInvoice';
import Invoices from './Pages/Invoices';
import Business from './Pages/Business';
import Profile from './Pages/Profile';
import DashboardLayout from './Components/DashboardLayout';
import EditDraftInvoice from './Pages/EditDraftInvoice';
import InvoicePreview from './Pages/InvoicePreview';

function App() {
  return (
   <>
   <Router>
    <Routes>
      {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register_User />} /> {/* Create Register component similar to Login */}
        <Route path="/home" element={<HomePage />} /> {/* Create Register component similar to Login */}
        
        {/* Protected Routes with Sidebar */}
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/create-invoice" element={<DashboardLayout><CreateInvoice /></DashboardLayout>} />
        <Route path="/invoices" element={<DashboardLayout><Invoices /></DashboardLayout>} />
        <Route path="/business" element={<DashboardLayout><Business /></DashboardLayout>} />
        <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
        <Route path="/invoice/edit/:id" element={<DashboardLayout><EditDraftInvoice /></DashboardLayout>} />
        <Route path="/invoice/view/:id" element={<DashboardLayout><InvoicePreview /></DashboardLayout>} />

        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Navigate to="/home" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
   </Router>
   </>
  );
}

export default App;
