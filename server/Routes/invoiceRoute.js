const express = require("express");
const router = express.Router();
const invoice = require("../Models/invoiceSchema");
const business = require("../Models/businessSchema");
const PDFDocument = require("pdfkit");


// Create Invoice
router.post("/create", async (req, res) => {
  try {
    const { customer, items, userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!customer || !customer.name) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    // Find business data
    const businessData = await business.findOne({ userId });
    if (!businessData) {
      return res.status(400).json({ message: "Business not found. Please create a business profile first." });
    }

    const businessId = businessData._id;

    // Create business snapshot
    const businessSnapshot = {
      businessName: businessData.businessName,
      businessOwner: businessData.businessOwner,
      address: businessData.Address,
      contactNo: businessData.contactNo,
      gstNumber: businessData.gstNumber,
      tax: {
        cgst: businessData.tax?.cgst || 0,
        sgst: businessData.tax?.sgst || 0
      }
    };

    // Calculate totals
    let subTotal = 0;
    let taxAmount = 0;

    const updatedItems = items.map(item => {
      const itemSubtotal = item.price * item.quantity;
      const cgstAmount = (businessData.tax?.cgst || 0) / 100 * itemSubtotal;
      const sgstAmount = (businessData.tax?.sgst || 0) / 100 * itemSubtotal;
      const itemTotal = itemSubtotal + cgstAmount + sgstAmount;

      subTotal += itemSubtotal;
      taxAmount += cgstAmount + sgstAmount;

      return {
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        tax: {
          cgst: businessData.tax?.cgst || 0,
          sgst: businessData.tax?.sgst || 0
        },
        total: itemTotal
      };
    });

    const grandTotal = subTotal + taxAmount;

    // Create new invoice
    const newInvoice = await invoice.create({
      userId,
      businessId,
    //   invoiceNumber: null, // Will be assigned later or by another system
      businessSnapshot,
      customer: {
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || ''
      },
      items: updatedItems,
      subTotal: subTotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      status: "draft"
    });

    return res.status(201).json({ 
      message: "Invoice created successfully", 
      invoice: newInvoice 
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});


// get all invoices

router.get("/allmy/:userId", async (req, res) => {
    try {
        const {userId}=req.params ;
        const limit = parseInt(req.query.limit) || 0;
        if(limit>0){
            const myinvoices = await invoice.find({ userId }).sort({ createdAt: -1 }).limit(limit);
            if (!myinvoices) {
                return res.status(401).json({ message: "no invoice exist" });
            }
            return res.status(201).json({ message: "all invoices fetched successfully..", invoices: myinvoices });
        }
        else{

            const myinvoices = await invoice.find({ userId }).sort({ createdAt: -1 });
            if (!myinvoices) {
                return res.status(401).json({ message: "no invoice exist" });
            }
            return res.status(201).json({ message: "all invoices fetched successfully..", invoices: myinvoices });
        }

    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

// to get particular invoice using id 

router.get("/my/:id", async (req, res) => {
    try {
        const invoiceid = req.params.id;
        const myinvoices = await invoice.findById(invoiceid);
        if (!myinvoices) {
            return res.status(401).json({ message: "no invoice exist" });
        }
        return res.status(201).json({ message: "invoices fetched successfully..", invoice: myinvoices });

    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

// to update invoices only when we havee draft status 

router.put("/:id", async (req, res) => {
    try {
        const invoiceid = req.params.id;
        const { customer, items } = req.body;
        const existInvoice = await invoice.findById(invoiceid);
        if (!existInvoice) {
            return res.status(401).json({ message: "no invoice exist" });
        }
        if (existInvoice.status !== "draft") {
            return res.status(401).json({ message: "invoices cannot updated.." });
        }
        const businessdata = await business.findById(existInvoice.businessId);
        if (!businessdata) {
            return res.status(201).json({ message: "businesdata not found.." });
        }
        // calculate tax for updated value
        let subTotal = 0;
        let taxAmount = 0;
        const updatedItems = items.map(item => {
            const cgstAmount = (businessdata.tax.cgst / 100) * item.price * item.quantity;
            const sgstAmount = (businessdata.tax.sgst / 100) * item.price * item.quantity;
            const total = item.price * item.quantity + cgstAmount + sgstAmount;

            subTotal += item.price * item.quantity;
            taxAmount += cgstAmount + sgstAmount;

            return {
                ...item,
                tax: {
                    cgst: businessdata.tax.cgst,
                    sgst: businessdata.tax.sgst
                },
                total
            };
        });
        const grandTotal = subTotal + taxAmount;

        // update the invoice...
        existInvoice.customer=customer;
        existInvoice.items=updatedItems;
        existInvoice.subTotal=subTotal;
        existInvoice.taxAmount=taxAmount;
        existInvoice.grandTotal=grandTotal;
        await existInvoice.save();
        return res.status(201).json({ message: "invoices updated successfully..", invoices:existInvoice  });

    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

// to finalize the invoice,allocate invoiceno and change status from draft to unpaid
router.put("/finalize/:id", async (req, res) => {
    try {
        const invoiceid = req.params.id;
        const existInvoice = await invoice.findById(invoiceid);
        if (!existInvoice) {
            return res.status(401).json({ message: "no invoice exist" });
        }
        if (existInvoice.status !== "draft") {
            return res.status(401).json({ message: "invoices cannot finalized.." });
        }

        // update the invoice...draft to unpaid and give unique invoice no.
        existInvoice.status="unpaid";
        existInvoice.invoiceNumber=`INV-${Date.now()} `;
        await existInvoice.save();
        return res.status(201).json({ message: "invoices finalized successfully..", invoice:existInvoice  });

    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})


// to change status from unpaid to paid 
router.put("/paid/:id", async (req, res) => {
    try {
        const invoiceid = req.params.id;
        const existInvoice = await invoice.findById(invoiceid);
        if (!existInvoice) {
            return res.status(401).json({ message: "no invoice exist" });
        }
        if (existInvoice.status !== "unpaid") {
            return res.status(401).json({ message: "invoices status cannot made paid.." });
        }
        // change status
        existInvoice.status="paid";
        await existInvoice.save();
        return res.status(201).json({ message: "invoices status changed successfully..", invoices:existInvoice  });

    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

// to cancel any draft or unpaid invoices
router.put("/cancel/:id", async (req, res) => {
    try {
        const invoiceid = req.params.id;
        const existInvoice = await invoice.findById(invoiceid);
        if (!existInvoice) {
            return res.status(401).json({ message: "no invoice exist" });
        }
        if (existInvoice.status === "cancelled") {
            return res.status(401).json({ message: "invoices is already cancelled.." });
        }
        if (existInvoice.status === "paid") {
            return res.status(401).json({ message: "paid invoices cannot be cancelled.." });
        }
        // change status from draft/ unpaid to cancelled
        existInvoice.status="cancelled";
        await existInvoice.save();
        return res.status(201).json({ message: "invoices cancelled successfully..", invoices:existInvoice  });

    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.get("/download/:id", async (req, res) => {
  try {
    const invoicedoc = await invoice.findById(req.params.id);

    if (!invoicedoc) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoicedoc.invoiceNumber}.pdf`
    );

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    doc.pipe(res);

    // Colors
    const primaryColor = '#059669';
    const textDark = '#1e293b';
    const textGray = '#64748b';
    const lightBg = '#f8fafc';

    // Helper function for status badge
    const getStatusText = (status) => {
      const statusMap = {
        paid: 'Paid',
        unpaid: 'Unpaid',
        draft: 'Draft',
        cancelled: 'Cancelled'
      };
      return statusMap[status] || 'Draft';
    };

    // ===== HEADER SECTION =====
    doc.fontSize(24).fillColor(textDark).text(invoicedoc.businessSnapshot.businessName, 50, 50, { continued: false });
    doc.fontSize(11).fillColor(textGray).text(invoicedoc.businessSnapshot.businessOwner, 50, 78, { continued: false });

    // Invoice title and number (right side)
    doc.fontSize(28).fillColor(textDark).text('INVOICE', 400, 50, { align: 'right', continued: false });
    doc.fontSize(12).fillColor(textGray).text(invoicedoc.invoiceNumber || 'DRAFT', 400, 85, { align: 'right', continued: false });
    
    // Status badge
    doc.fontSize(10).fillColor(primaryColor).text(getStatusText(invoicedoc.status), 400, 105, { align: 'right', continued: false });

    // Horizontal line
    doc.strokeColor('#e2e8f0').lineWidth(2).moveTo(50, 130).lineTo(545, 130).stroke();

    // ===== INFO SECTION (3 columns) =====
    let yPos = 160;

    // Column 1: From
    doc.fontSize(10).fillColor(textGray).text('FROM', 50, yPos, { continued: false });
    yPos += 15;
    doc.fontSize(11).fillColor(textDark).text(invoicedoc.businessSnapshot.businessName, 50, yPos, { width: 150, continued: false });
    yPos += 18;
    doc.fontSize(9).fillColor(textGray).text(invoicedoc.businessSnapshot.address, 50, yPos, { width: 150, continued: false });
    yPos += 15;
    doc.text(invoicedoc.businessSnapshot.contactNo, 50, yPos, { continued: false });
    yPos += 15;
    if (invoicedoc.businessSnapshot.gstNumber) {
      doc.text(`GST: ${invoicedoc.businessSnapshot.gstNumber}`, 50, yPos, { continued: false });
    }

    // Column 2: Bill To
    yPos = 160;
    doc.fontSize(10).fillColor(textGray).text('BILL TO', 220, yPos, { continued: false });
    yPos += 15;
    doc.fontSize(11).fillColor(textDark).text(invoicedoc.customer.name, 220, yPos, { width: 150, continued: false });
    yPos += 18;
    if (invoicedoc.customer.address) {
      doc.fontSize(9).fillColor(textGray).text(invoicedoc.customer.address, 220, yPos, { width: 150, continued: false });
      yPos += 15;
    }
    if (invoicedoc.customer.phone) {
      doc.text(invoicedoc.customer.phone, 220, yPos, { continued: false });
      yPos += 15;
    }
    if (invoicedoc.customer.email) {
      doc.text(invoicedoc.customer.email, 220, yPos, { continued: false });
    }

    // Column 3: Invoice Details
    yPos = 160;
    doc.fontSize(10).fillColor(textGray).text('INVOICE DETAILS', 400, yPos, { continued: false });
    yPos += 15;
    doc.fontSize(9).fillColor(textDark).text(`Date: ${new Date(invoicedoc.invoiceDate).toLocaleDateString('en-IN')}`, 400, yPos, { continued: false });

    // ===== ITEMS TABLE =====
    yPos = 280;
    
    // Table header background
    doc.rect(50, yPos, 495, 25).fillColor('#f8fafc').fill();
    
    // Table headers - Draw each header separately with explicit positioning
    const headerY = yPos + 8;
    doc.fontSize(9).fillColor(textGray);
    doc.text('ITEM', 60, headerY, { width: 200, continued: false });
    doc.text('QTY', 260, headerY, { width: 40, align: 'center', continued: false });
    doc.text('PRICE', 310, headerY, { width: 60, align: 'center', continued: false });
    doc.text('CGST', 380, headerY, { width: 40, align: 'center', continued: false });
    doc.text('SGST', 430, headerY, { width: 40, align: 'center', continued: false });
    doc.text('TOTAL', 480, headerY, { width: 55, align: 'right', continued: false });

    yPos += 25;

    // Table rows
    invoicedoc.items.forEach((item, index) => {
      // Add new page if needed
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }

      // Alternating row background
      if (index % 2 === 0) {
        doc.rect(50, yPos, 495, 30).fillColor('#fafafa').fill();
      }

      const rowY = yPos + 10;
      
      // Draw each cell separately with explicit positioning
      doc.fontSize(9).fillColor(textDark);
      doc.text(item.itemName, 60, rowY, { width: 190, continued: false });
      
      doc.fontSize(9).fillColor(textDark);
      doc.text(item.quantity.toString(), 260, rowY, { width: 40, align: 'center', continued: false });
      
      doc.fontSize(9).fillColor(textDark);
      doc.text(`₹${item.price.toLocaleString()}`, 310, rowY, { width: 60, align: 'center', continued: false });
      
      doc.fontSize(9).fillColor(textDark);
      doc.text(`${item.tax.cgst}%`, 380, rowY, { width: 40, align: 'center', continued: false });
      
      doc.fontSize(9).fillColor(textDark);
      doc.text(`${item.tax.sgst}%`, 430, rowY, { width: 40, align: 'center', continued: false });
      
      doc.fontSize(9).fillColor(textDark);
      doc.text(`₹${item.total.toLocaleString()}`, 480, rowY, { width: 55, align: 'right', continued: false });

      // Row border
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, yPos + 30).lineTo(545, yPos + 30).stroke();
      
      yPos += 30;
    });

    // ===== TOTALS SECTION =====
    yPos += 40;
    
    // Larger background box for totals with more width
    const totalsBoxHeight = 120;
    const totalsBoxWidth = 250;
    const totalsBoxX = 295;
    doc.rect(totalsBoxX, yPos, totalsBoxWidth, totalsBoxHeight).fillColor('#f8fafc').fill();
    doc.strokeColor('#e2e8f0').lineWidth(1).rect(totalsBoxX, yPos, totalsBoxWidth, totalsBoxHeight).stroke();

    let totalsY = yPos + 20;
    const labelX = totalsBoxX + 20;
    const valueX = totalsBoxX + totalsBoxWidth - 20;

    // Subtotal - Draw label and value separately
    doc.fontSize(11).fillColor(textGray);
    doc.text('Subtotal:', labelX, totalsY, { continued: false });
    
    doc.fontSize(11).fillColor(textDark);
    doc.text(`₹${invoicedoc.subTotal.toLocaleString()}`, labelX, totalsY, { width: totalsBoxWidth - 40, align: 'right', continued: false });
    
    totalsY += 25;

    // Tax Amount - Draw label and value separately
    doc.fontSize(11).fillColor(textGray);
    doc.text('Tax Amount:', labelX, totalsY, { continued: false });
    
    doc.fontSize(11).fillColor(textDark);
    doc.text(`₹${invoicedoc.taxAmount.toLocaleString()}`, labelX, totalsY, { width: totalsBoxWidth - 40, align: 'right', continued: false });
    
    totalsY += 30;

    // Grand Total separator line
    doc.strokeColor(primaryColor).lineWidth(2).moveTo(labelX, totalsY).lineTo(valueX, totalsY).stroke();
    totalsY += 15;

    // Grand Total - Draw label and value separately
    doc.fontSize(13).fillColor(textDark);
    doc.text('Grand Total:', labelX, totalsY, { continued: false });
    
    doc.fontSize(16).fillColor(primaryColor);
    doc.text(`₹${invoicedoc.grandTotal.toLocaleString()}`, labelX, totalsY, { width: totalsBoxWidth - 40, align: 'right', continued: false });

    // ===== FOOTER =====
    yPos = totalsY + 60;
    
    // Check if footer will fit on current page, if not add new page
    if (yPos > 720) {
      doc.addPage();
      yPos = 700;
    }
    
    doc.strokeColor('#e2e8f0').lineWidth(2).moveTo(50, yPos).lineTo(545, yPos).stroke();
    yPos += 20;
    
    doc.fontSize(12).fillColor(textDark);
    doc.text('Thank you for your business!', 50, yPos, { align: 'center', width: 495, continued: false });
    yPos += 22;
    
    doc.fontSize(9).fillColor(textGray);
    doc.text('This is a computer-generated invoice', 50, yPos, { align: 'center', width: 495, continued: false });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});
module.exports = router;