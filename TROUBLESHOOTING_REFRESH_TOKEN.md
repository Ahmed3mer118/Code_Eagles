# دليل استكشاف أخطاء الـ Refresh Token

## المشكلة: خطأ 401 عند تجديد الـ Token

إذا كنت تواجه خطأ `POST https://api-codeeagles-cpq8.vercel.app/api/users/refresh-token 401 (Unauthorized)`، فهذا الدليل سيساعدك في تشخيص وحل المشكلة.

## 🔍 خطوات التشخيص

### 1. استخدام Debug Panel (في وضع التطوير)

في وضع التطوير، ستجد زر 🐛 في أسفل يمين الشاشة. انقر عليه لفتح Debug Panel:

1. **انقر على "🔍 Run Debug"** - سيفحص حالة الـ token والـ cookies
2. **انقر على "🔄 Test Refresh Token"** - سيختبر نقطة نهاية الـ refresh token
3. **تحقق من Console** - ستجد رسائل مفصلة عن المشكلة

### 2. فحص Console للرسائل

افتح Developer Tools (F12) وانتقل إلى Console. ابحث عن الرسائل التالية:

#### رسائل النجاح:
- ✅ "Token refreshed successfully"
- ✅ "Authentication restored"
- ✅ "Authentication is valid"

#### رسائل الخطأ:
- ❌ "401 Unauthorized - Refresh token is invalid or expired"
- ❌ "Token refresh failed"
- ❌ "Authentication failed - refresh token failed"

### 3. فحص Network Tab

في Developer Tools، انتقل إلى Network tab:

1. **ابحث عن طلب `/api/users/refresh-token`**
2. **تحقق من Request Headers:**
   - يجب أن يكون `Cookie` موجود
   - يجب أن يكون `Content-Type: application/json`
3. **تحقق من Response:**
   - Status: 401 يعني مشكلة في الـ refresh token
   - Status: 200 يعني نجح الطلب

## 🛠️ الحلول المحتملة

### الحل 1: إعادة تسجيل الدخول

إذا كان الـ refresh token منتهي الصلاحية:

```javascript
// في console المتصفح
serviceFactory.forceLogout();
```

أو انقر على "🚪 Force Logout" في Debug Panel.

### الحل 2: فحص إعدادات الـ Cookies

تأكد من أن الـ cookies مفعلة:

```javascript
// في console المتصفح
import { areCookiesEnabled } from './src/utils/tokenUtils';
console.log("Cookies enabled:", areCookiesEnabled());
```

### الحل 3: فحص إعدادات الباك إند

تأكد من أن الباك إند مهيأ بشكل صحيح:

```javascript
// في الباك إند
app.use(cors({
  origin: 'https://your-frontend-domain.com', // أو localhost:3000 للتطوير
  credentials: true // مهم جداً
}));

// عند إرسال الـ cookies
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true في production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

### الحل 4: فحص الـ Domain والـ Protocol

تأكد من أن الـ frontend والـ backend على نفس الـ domain أو مهيأين للـ CORS:

```javascript
// في console المتصفح
console.log("Current domain:", window.location.hostname);
console.log("Current protocol:", window.location.protocol);
```

## 🔧 أدوات التشخيص المتقدمة

### استخدام Debug Functions

```javascript
// في console المتصفح
import { debugRefreshTokenIssues, testRefreshToken } from './src/utils/tokenUtils';

// تشخيص شامل
const issues = debugRefreshTokenIssues(token);

// اختبار نقطة نهاية الـ refresh token
await testRefreshToken('https://api-codeeagles-cpq8.vercel.app');
```

### فحص حالة الـ Token

```javascript
// في console المتصفح
import { formatTimeUntilExpiration, isTokenExpired } from './src/utils/tokenUtils';

const token = localStorage.getItem('token');
console.log("Token expires in:", formatTimeUntilExpiration(token));
console.log("Token is expired:", isTokenExpired(token));
```

## 🚨 الأسباب الشائعة للخطأ 401

### 1. الـ Refresh Token منتهي الصلاحية
- **الأعراض:** خطأ 401 مع رسالة "Invalid refresh token"
- **الحل:** إعادة تسجيل الدخول

### 2. الـ Cookies غير مفعلة
- **الأعراض:** لا توجد cookies في Network tab
- **الحل:** تفعيل الـ cookies في المتصفح

### 3. مشاكل الـ CORS
- **الأعراض:** خطأ في Network tab
- **الحل:** التأكد من إعدادات الـ CORS في الباك إند

### 4. الـ Refresh Token تم حذفه من الباك إند
- **الأعراض:** خطأ 401 فوري
- **الحل:** إعادة تسجيل الدخول

### 5. مشاكل الـ Domain
- **الأعراض:** الـ cookies لا تُرسل
- **الحل:** التأكد من أن الـ frontend والـ backend على نفس الـ domain

## 📋 قائمة التحقق

قبل الإبلاغ عن مشكلة، تأكد من:

- [ ] الـ cookies مفعلة في المتصفح
- [ ] أنت تستخدم HTTPS في production
- [ ] الـ frontend والـ backend على نفس الـ domain أو مهيأين للـ CORS
- [ ] جربت إعادة تسجيل الدخول
- [ ] فحصت Console للرسائل
- [ ] فحصت Network tab للطلبات

## 🆘 الحصول على المساعدة

إذا لم تحل المشكلة:

1. **اجمع المعلومات:**
   - لقطة شاشة من Console
   - لقطة شاشة من Network tab
   - رسائل الخطأ الكاملة

2. **أرسل المعلومات:**
   - نوع المتصفح والإصدار
   - نظام التشغيل
   - الـ URL الذي حدثت فيه المشكلة
   - خطوات إعادة إنتاج المشكلة

## 🔄 إعادة تعيين كاملة

إذا فشلت جميع الحلول:

```javascript
// في console المتصفح
// مسح جميع البيانات
localStorage.clear();
sessionStorage.clear();

// حذف جميع الـ cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// إعادة تحميل الصفحة
window.location.reload();
```

## 📞 الدعم

للمساعدة الإضافية، يرجى تقديم:
- وصف مفصل للمشكلة
- لقطات شاشة من Console و Network tab
- خطوات إعادة إنتاج المشكلة
- معلومات البيئة (المتصفح، نظام التشغيل، إلخ)
