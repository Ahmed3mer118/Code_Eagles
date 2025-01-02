import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // هنا يمكن إضافة منطق تسجيل الدخول
  };

  return (
    <div className="container">
      <h2 className="my-4">تسجيل الدخول</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="أدخل بريدك الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">كلمة المرور</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="أدخل كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">تسجيل الدخول</button>
      </form>
    </div>
  );
};

export default Login;
