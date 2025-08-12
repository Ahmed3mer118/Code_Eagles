# نظام الـ Refresh Token المبسط

## كيف يعمل النظام

### 1. عند تسجيل الدخول
- الباك إند يرسل `access token` في الـ response
- الباك إند يرسل `refresh token` كـ httpOnly cookie
- الفرونت إند يحفظ الـ access token في localStorage

### 2. عند انتهاء صلاحية الـ Access Token
- أي طلب API سيرجع خطأ 401
- الـ interceptor يتحقق من وجود token أولاً
- إذا وجد token، يحاول تجديده
- إذا نجح، يعيد تنفيذ الطلب الأصلي
- إذا فشل، يوجه المستخدم لصفحة الدخول

### 3. كيف يتم التجديد
```javascript
// في Auth.ts
async refreshToken() {
  // تحقق من وجود token قبل محاولة التجديد
  if (!this.getToken()) {
    console.log("⚠️ لا يوجد token للتجديد");
    return null;
  }

  const response = await this.axiosInstance.post("/api/users/refresh-token", {}, {
    withCredentials: true, // يرسل الـ httpOnly cookie تلقائياً
  });
  
  if (response.data.accessToken) {
    this.setToken(response.data.accessToken);
    return response.data.accessToken;
  }
  return null;
}
```

### 4. الـ Interceptor المحسن
```javascript
// في Auth.ts
private setupInterceptors() {
  this.axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // تحقق من وجود token قبل محاولة التجديد
      if (error.response?.status === 401 && !error.config._retry && this.getToken()) {
        error.config._retry = true;
        
        const newToken = await this.refreshToken();
        if (newToken) {
          error.config.headers["Authorization"] = newToken;
          return this.axiosInstance(error.config);
        } else {
          this.handleLogout();
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );
}
```

## الاستخدام

### في أي مكون React
```javascript
import serviceFactory from '../utils/serviceFactory';

// تحقق من وجود token أولاً
const token = serviceFactory.getToken();
if (!token) {
  // إعادة توجيه للدخول
  navigate("/auth/login");
  return;
}

// الحصول على الخدمة
const instructorService = serviceFactory.getInstructorService();

// استخدام الخدمة - الـ refresh token يعمل تلقائياً
const groups = await instructorService.getAllGroups();
```

### إذا أردت تجديد الـ token يدوياً
```javascript
const newToken = await serviceFactory.refreshToken();
```

### إذا أردت تسجيل الخروج
```javascript
serviceFactory.forceLogout();
```

## المميزات

✅ **تلقائي** - لا تحتاج لتدخل منك  
✅ **شفاف** - يعمل في الخلفية  
✅ **آمن** - يستخدم httpOnly cookies  
✅ **بسيط** - لا تحتاج لكتابة كود إضافي  
✅ **ذكي** - لا يحاول التجديد بدون token  

## التحسينات الجديدة

### 1. فحص وجود Token
- لا يحاول التجديد إذا لم يكن هناك token
- يمنع الطلبات غير الضرورية
- يحسن الأداء

### 2. رسائل واضحة
- `⚠️ لا يوجد token للتجديد` - عندما لا يوجد token
- `🔄 محاولة تجديد الـ token...` - بدأ التجديد
- `✅ تم تجديد الـ token بنجاح` - نجح التجديد
- `❌ فشل في تجديد الـ token` - فشل التجديد

### 3. فحص في المكونات
- يتحقق من وجود token قبل استخدام الخدمات
- يوجه للدخول إذا لم يكن هناك token

## ملاحظات مهمة

1. **الباك إند يجب أن يرسل الـ cookies بشكل صحيح:**
```javascript
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

2. **الباك إند يجب أن يكون مهيأ للـ CORS:**
```javascript
app.use(cors({
  origin: 'http://localhost:3000', // أو domain الخاص بك
  credentials: true
}));
```

3. **الفرونت إند يجب أن يستخدم `withCredentials: true`**

## استكشاف الأخطاء

إذا لم يعمل الـ refresh token:

1. **تحقق من Console** - ستجد رسائل واضحة
2. **تحقق من Network tab** - ابحث عن طلب `/api/users/refresh-token`
3. **تأكد من إعدادات الباك إند** - CORS و cookies
4. **جرب إعادة تسجيل الدخول** - `serviceFactory.forceLogout()`

## الرسائل في Console

- `⚠️ لا يوجد token للتجديد` - لا يوجد token للتجديد
- `🔄 محاولة تجديد الـ token...` - بدأ التجديد
- `✅ تم تجديد الـ token بنجاح` - نجح التجديد
- `❌ فشل في تجديد الـ token` - فشل التجديد
- `🚪 تسجيل الخروج...` - إعادة توجيه للدخول
