import React, { useState } from "react";
import axios from "axios";

const PaymentComponent = () => {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_TOKEN = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjFjMlZ5WDJsa0lqb3hPRGt6TmpnNUxDSmhiVzkxYm5SZlkyVnVkSE1pT2pFd01EQXNJbU4xY25KbGJtTjVJam9pUlVkUUlpd2lhVzUwWldkeVlYUnBiMjVmYVdRaU9qUTVNVFl6TWpRc0ltOXlaR1Z5WDJsa0lqb3lPRGd4TURNeE5qVXNJbUpwYkd4cGJtZGZaR0YwWVNJNmV5Sm1hWEp6ZEY5dVlXMWxJam9pU205b2JpSXNJbXhoYzNSZmJtRnRaU0k2SWtSdlpTSXNJbk4wY21WbGRDSTZJakV5TXlCVGRISmxaWFFpTENKaWRXbHNaR2x1WnlJNklqRXlJaXdpWm14dmIzSWlPaUl6SWl3aVlYQmhjblJ0Wlc1MElqb2lOU0lzSW1OcGRIa2lPaUpEWVdseWJ5SXNJbk4wWVhSbElqb2lUa0VpTENKamIzVnVkSEo1SWpvaVJVY2lMQ0psYldGcGJDSTZJbXB2YUc0dVpHOWxRR1Y0WVcxd2JHVXVZMjl0SWl3aWNHaHZibVZmYm5WdFltVnlJam9pS3pJd01USXpORFUyTnpnNU1DSXNJbkJ2YzNSaGJGOWpiMlJsSWpvaVRrRWlMQ0psZUhSeVlWOWtaWE5qY21sd2RHbHZiaUk2SWs1QkluMHNJbXh2WTJ0ZmIzSmtaWEpmZDJobGJsOXdZV2xrSWpwbVlXeHpaU3dpWlhoMGNtRWlPbnQ5TENKemFXNW5iR1ZmY0dGNWJXVnVkRjloZEhSbGJYQjBJanBtWVd4elpTd2laWGh3SWpveE56TTNOVFUwTlRnM0xDSndiV3RmYVhBaU9pSXhNREl1TVRnNExqRTVOaTQyTWlKOS5oRXd5RS05TWNlQUE4RVpLQ1FzYThTSGpDTUQ2bXpuSDBtVkp2aGxUejVfTE1XdHEzbzBudTltRWdCNG83ZGR5TXlqdEVPbmloa2V3MGl6LXBjTTVMUQ=="; // استبدل بالـ Token الذي حصلت عليه
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

      // console.log(orderResponse.data)
      const orderId = orderResponse.data.id; // Order ID

      // 2. إنشاء مفتاح دفع (Payment Key)
      const paymentKeyResponse = await axios.post(
        "https://accept.paymob.com/api/acceptance/payment_keys",
        {
          auth_token: API_TOKEN,
          amount_cents: amount * 100, // تحويل المبلغ إلى قروش
          expiration: 3600, // مدة صلاحية المفتاح بالثواني
          order_id: orderId,
          billing_data: {
            apartment: "803",
            email: "claudette09@exa.com",
            floor: "42",
            first_name: "Clifford",
            street: "Ethan Land",
            building: "8028",
            phone_number: "+86(8)9135210487",
            shipping_method: "PKG",
            postal_code: "01898",
            city: "Jaskolskiburgh",
            country: "CR",
            last_name: "Nicolas",
            state: "Utah",
          },
          currency: "EGP",
          integration_id: INTEGRATION_ID,
        }
      );

      const paymentKey = paymentKeyResponse.data.token; // Payment Key
      // console.log(paymentKeyResponse.data)

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
    <div>
      <h1>دفع عبر Paymob</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="المبلغ بالجنيه"
      />
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "جاري التحميل..." : "ابدأ الدفع"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default PaymentComponent;