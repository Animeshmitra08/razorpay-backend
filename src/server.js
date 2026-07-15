const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* ---------------- CONFIG ---------------- */

const razorpay = new Razorpay({
  key_id: "rzp_test_T7SsMb9hoRghfG",       // 🔴 replace
  key_secret: "hdHa8f9CU0o494l6WPoKeIUU",     // 🔴 replace
});

/* ---------------- CREATE ORDER ---------------- */

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert ₹ to paise
      currency: "INR",
      receipt: "txn_" + Date.now(), // your custom id
    };

    const order = await razorpay.orders.create(options);
    console.log(order);
    

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating order");
  }
});

/* ---------------- VERIFY PAYMENT ---------------- */

app.post("/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", "hdHa8f9CU0o494l6WPoKeIUU") // 🔴 same secret
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (err) {
    res.status(500).send("Verification failed");
  }
});

/* ---------------- START SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});