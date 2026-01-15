const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    //  Business 
    businessSnapshot: {
      businessName: String,
      businessOwner: String,
      address: String,
      contactNo: String,
      gstNumber: String,
      tax: {
        cgst: Number,
        sgst: Number,
      },
      logo: String,
    },

    //  Customer details
    customer: {
      name: {
        type: String,
        required: true,
      },
      phone: String,
      email: String,
      address: String,
    },

    //  Invoice items
    items: [
      {
        itemName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        taxPercent: {
          type: Number,
            required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],

    //  Totals
    subTotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },

    //  Payment info
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    paymentDate: Date,

    invoiceDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
