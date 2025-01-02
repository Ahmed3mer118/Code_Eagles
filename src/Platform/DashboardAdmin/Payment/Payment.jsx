import React, { useState } from "react";
import axios from "axios";

function PaymentComponent() {
  const [amount, setAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const API_KEY =
    "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBeE5UZzBNU3dpYm1GdFpTSTZJakUzTXpVNE5ETTVPRFV1TkRNek5qYzRJbjAuVWQwbV9qSDY1TUNWTm9pTmIwNTFxam1vd1VsUUhrblBNX1VvUDlmMXMzVDVxUFRKV2s3V1NXTS1UUVFPb0FYNHZma2xYX1VVZTBINzJNa1JTdTk5NGc=AB5C4DF526A2CBBED0979CAB6BAA8FAF"; // Replace with your API Key
  const SECRET_KEY = "AB5C4DF526A2CBBED0979CAB6BAA8FAF";

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStatus("");

    try {
      // 1. Create payment order
      const orderResponse = await axios.post(
        "https://accept.paymob.com/api/ecommerce/orders/transaction_inquiry",
        {
          amount: amount,
          currency: "EGP",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`, // Ensure to use Bearer
          },
        }
      );

      const orderData = orderResponse.data;
      if (orderData.id) {
        // 2. Prepare payment link
        const paymentLinkResponse = await axios.post(
          "https://accept.paymob.com/api/acceptance/payment_keys",
          {
            amount: amount,
            order_id: orderData.id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SECRET_KEY}`, // Ensure to use Bearer
            },
          }
        );

        const paymentLinkData = paymentLinkResponse.data;
        if (paymentLinkData && paymentLinkData.token) {
          window.location.href = `https://accept.paymob.com/api/acceptance/iframes/891699?payment_token=${paymentLinkData.token}`;
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus(
        "An error occurred while processing the payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Payment for Course</h2>
      <div className="form-group">
        <label htmlFor="amount">Set Course Price (EGP):</label>
        <input
          type="number"
          className="form-control"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter course price"
        />
      </div>
      <p className="text-center">Course Price: {amount} EGP</p>
      <button
        className="btn btn-primary btn-block"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {paymentStatus && (
        <p className="text-danger text-center">{paymentStatus}</p>
      )}
    </div>
  );
}

export default PaymentComponent;
