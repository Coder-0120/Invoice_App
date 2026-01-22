const express = require('express');
const router = express.Router();
const Invoice = require('../Models/invoiceSchema');


router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId; 
    
    const totalInvoices = await Invoice.countDocuments({ userId });
    const paid = await Invoice.countDocuments({ userId, status: 'paid' });
    const unpaid = await Invoice.countDocuments({ userId, status: 'unpaid' });
    const draft = await Invoice.countDocuments({ userId, status: 'draft' });
    const cancelled = await Invoice.countDocuments({ userId, status: 'cancelled' });
    
    res.json({ totalInvoices, paid, unpaid, draft, cancelled });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;