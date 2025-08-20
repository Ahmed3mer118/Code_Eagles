import React from "react";
import Loading from "../User/shared/Loading";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, triedReload: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // لو لسه مجربناش reload
    if (!this.state.triedReload) {
      this.setState({ triedReload: true }, () => {
        // نتأكد إننا مش هندخل في loop باستخدام sessionStorage
        if (this.state.hasError) {
        //   sessionStorage.setItem("hasReloaded", "true");
          window.location.reload();
        }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        // <div style={{ textAlign: "center", marginTop: "50px" }}>
        //   <h2>في مشكلة في تحميل الصفحة 🚨</h2>
        //   <button onClick={() => (window.location.href = "/")}>
        //     الرجوع للصفحة الرئيسية
        //   </button>
        // </div>
        <Loading />
      );
    }

    return this.props.children;
  }
}
