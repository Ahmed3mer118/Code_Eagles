import React, { useState } from "react";
import axios from "axios";

const PaymentComponent = () => {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_TOKEN = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBeE5UZzBNU3dpY0doaGMyZ2lPaUl6TldZMk5UZzNNREpqT0RBd09UWTBNRE5rTm1NMk5XTXhZekprTkRRNU9UazBZelF5WVdKaE4yVTFNelZsTWpaaU9XRTJPRFUyTUdRek1USXdZMkV3SWl3aVpYaHdJam94TnpNNE1ESXhNemN4ZlEuZnppQmk4M2pveEl5ZjdTLURNTkl0ZGZyZ05iQllpNjNSUVVLdndGcTJKU0thN2Vud0h0RlBKRVNrclVGR0RGdWlScFQzd2pEb0xOemJlZ3ktZUxma1E=";
  const INTEGRATION_ID = "4916386"; // استبدل بمعرف التكامل الخاص بك
  const IFRAME_ID = "891699"; // استبدل بمعرف الإطار الخاص بك

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. إنشاء طلب (Order)
      const orderResponse = await axios.post(
        "https://accept.paymob.com/api/ecommerce/orders",
        {
          auth_token: API_TOKEN,
          delivery_needed: "false",
          amount_cents: amount * 100, // تحويل المبلغ إلى قروش
          currency: "EGP",
          items: [],
        }
      );

      // const orderId = orderResponse.data.id; // Order ID

      // 2. إنشاء مفتاح دفع (Payment Key)
      const paymentKeyResponse = await axios.post(
        "https://accept.paymob.com/api/acceptance/payment_keys",
        {
          auth_token: API_TOKEN,
          amount_cents: amount * 100,
          expiration: 600000, 
          order_id: 288107765,
          billing_data: {
            apartment: "803",
            email: "amer73090@gmail.com",
            floor: "3",
            first_name: "Ahmed",
            street: "El Obour",
            building: "8028",
            phone_number: "+201033705805",
            shipping_method: "PKG",
            postal_code: "01898",
            city: "cairo",
            country: "EG",
            last_name: "Amer",
            state: "Utah",
          },
          currency: "EGP",
          integration_id: INTEGRATION_ID,
        }
      );

      const paymentKey = paymentKeyResponse.data.token; // Payment Key

      // 3. توجيه المستخدم إلى صفحة الدفع
      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentKey}`;
      window.location.href = paymentUrl;
    } catch (err) {
      setError("حدث خطأ أثناء إنشاء عملية الدفع. يرجى المحاولة مرة أخرى.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center">دفع عبر Paymob</h1>
              <div className="form-group">
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="المبلغ بالجنيه"
                />
              </div>
              <button
                className="btn btn-primary btn-block mt-3"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "جاري التحميل..." : "ابدأ الدفع"}
              </button>
              {error && <p className="text-danger mt-3">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentComponent;