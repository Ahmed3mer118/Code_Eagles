# دليل حل مشكلة عدم وجود Cookies

## المشكلة: ❌ No cookies found (including httpOnly ones)

هذه المشكلة تعني أن الـ refresh token لم يتم حفظه في المتصفح. إليك الحلول:

## 🔍 خطوات التشخيص السريع

### 1. استخدم Debug Panel
1. انقر على زر 🐛 في أسفل يمين الشاشة
2. انقر على "🔐 Check Auth State" - لفحص حالة المصادقة
3. انقر على "🍪 Debug Cookies" - لفحص إعدادات الـ cookies
4. انقر على "🔐 Test Login" - لاختبار نقطة نهاية الدخول

### 2. تحقق من Console
افتح Developer Tools (F12) وانتقل إلى Console. ابحث عن:
- رسائل الخطأ
- معلومات الـ cookies
- حالة المصادقة

## 🛠️ الحلول المحتملة

### الحل 1: إعادة تسجيل الدخول
```javascript
// في console المتصفح
serviceFactory.forceLogout();
```
ثم سجل دخولك مرة أخرى.

### الحل 2: فحص إعدادات الـ Cookies في المتصفح

#### Chrome:
1. اذهب إلى `chrome://settings/content/cookies`
2. تأكد من أن "Allow sites to save and read cookie data" مفعل
3. تحقق من "Block third-party cookies" - قد تحتاج لتعطيله مؤقتاً

#### Firefox:
1. اذهب إلى `about:preferences#privacy`
2. في "Cookies and Site Data" تأكد من "Accept cookies and site data"
3. تحقق من "Accept third-party cookies"

#### Safari:
1. اذهب إلى Preferences > Privacy
2. تأكد من أن "Block all cookies" غير مفعل

### الحل 3: فحص إعدادات الباك إند

تأكد من أن الباك إند يرسل الـ cookies بشكل صحيح:

```javascript
// في الباك إند - عند تسجيل الدخول
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true في production
  sameSite: 'lax', // أو 'none' إذا كان هناك مشاكل
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
});
```

### الحل 4: فحص إعدادات الـ CORS

```javascript
// في الباك إند
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com' 
    : 'http://localhost:3000',
  credentials: true, // مهم جداً
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### الحل 5: فحص الـ Domain والـ Protocol

تأكد من أن الـ frontend والـ backend على نفس الـ domain أو مهيأين للـ CORS:

```javascript
// في console المتصفح
console.log("Current domain:", window.location.hostname);
console.log("Current protocol:", window.location.protocol);
console.log("API URL:", import.meta.env.VITE_API_URL);
```

## 🚨 الأسباب الشائعة

### 1. المستخدم لم يسجل دخول بنجاح
- **الأعراض:** لا يوجد access token في localStorage
- **الحل:** إعادة تسجيل الدخول

### 2. الباك إند لا يرسل الـ cookies
- **الأعراض:** لا يوجد Set-Cookie header في استجابة الدخول
- **الحل:** فحص إعدادات الباك إند

### 3. إعدادات الـ cookies مقيدة جداً
- **الأعراض:** الـ cookies مفعلة لكن لا تُحفظ
- **الحل:** تعديل إعدادات المتصفح

### 4. مشاكل الـ Domain
- **الأعراض:** الـ frontend والـ backend على domains مختلفة
- **الحل:** إعداد الـ CORS بشكل صحيح

### 5. مشاكل الـ Protocol
- **الأعراض:** HTTP vs HTTPS
- **الحل:** استخدام HTTPS في production

## 🔧 أدوات التشخيص المتقدمة

### في Console المتصفح:

```javascript
// فحص شامل لحالة المصادقة
import { checkAuthenticationState } from './src/utils/tokenUtils';
const state = checkAuthenticationState();
console.log(state);

// فحص إعدادات الـ cookies
import { debugCookieSettings } from './src/utils/tokenUtils';
debugCookieSettings();

// اختبار نقطة نهاية الدخول
import { debugLoginProcess } from './src/utils/tokenUtils';
await debugLoginProcess('https://api-codeeagles-cpq8.vercel.app');
```

### فحص Network Tab:
1. افتح Developer Tools
2. انتقل إلى Network tab
3. سجل دخول
4. ابحث عن طلب الدخول
5. تحقق من Response Headers:
   - يجب أن يكون `Set-Cookie` موجود
   - تحقق من إعدادات الـ cookie

## 📋 قائمة التحقق

قبل الإبلاغ عن مشكلة:

- [ ] جربت إعادة تسجيل الدخول
- [ ] فحصت إعدادات الـ cookies في المتصفح
- [ ] تأكدت من أن الباك إند يرسل الـ cookies
- [ ] فحصت إعدادات الـ CORS
- [ ] تأكدت من الـ domain والـ protocol
- [ ] استخدمت Debug Panel
- [ ] فحصت Console للرسائل
- [ ] فحصت Network tab للطلبات

## 🆘 إذا لم تحل المشكلة

1. **اجمع المعلومات:**
   - لقطة شاشة من Debug Panel
   - لقطة شاشة من Console
   - لقطة شاشة من Network tab
   - إعدادات الـ cookies في المتصفح

2. **أرسل المعلومات:**
   - نوع المتصفح والإصدار
   - نظام التشغيل
   - الـ URL الذي حدثت فيه المشكلة
   - رسائل الخطأ الكاملة

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
- لقطات شاشة من Debug Panel
- لقطات شاشة من Console و Network tab
- إعدادات الـ cookies في المتصفح
- معلومات البيئة (المتصفح، نظام التشغيل، إلخ)
