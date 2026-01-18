const express = require("express");
const router = express.Router();
const invoice = require("../Models/invoiceSchema");
const business = require("../Models/businessSchema");

// create invoice
router.post("/create", async (req, res) => {
    try {
        const { customer, items } = req.body;
        const userId = "696958f1ec1caaaec092637d";
        const businessdata = await business.findOne({ userId });
        if (!businessdata) {
            return res.status(400).json({ message: "business not found" });
        }
        const businessId = businessdata._id;
        const businessSnapshot = {
            businessName: businessdata.businessName,
            businessOwner: businessdata.businessOwner,
            address: businessdata.Address,
            contactNo: businessdata.contactNo,
            gstNumber: businessdata.gstNumber,
            tax: businessdata.tax
        }
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

        const newInvoice = await invoice.create({
            userId,
            businessId,
            invoiceNumber:null,
            businessSnapshot,
            customer,
            items: updatedItems,
            subTotal,
            taxAmount,
            grandTotal,
            status: "draft"
        });

        return res.status(201).json({ message: "Invoice created successfully", invoice: newInvoice });


    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error " })

    }
})

// get all invoices

router.get("/my", async (req, res) => {
    try {
        // const {userId}=req.body ;
        const userId = "696958f1ec1caaaec092637d";
        const myinvoices = await invoice.find({ userId });
        if (!myinvoices) {
            return res.status(401).json({ message: "no invoice exist" });
        }
        return res.status(201).json({ message: "all invoices fetched successfully..", invoices: myinvoices });

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
        return res.status(201).json({ message: "invoices fetched successfully..", invoices: myinvoices });

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
        existInvoice.invoiceNumber="INV-002";
        await existInvoice.save();
        return res.status(201).json({ message: "invoices finalized successfully..", invoices:existInvoice  });

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


module.exports = router;