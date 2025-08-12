# نظام إدارة الـ Refresh Token المحسن

## المشكلة الأصلية
كان المحاضر لا يستطيع إكمال العمليات على الموقع بسبب مشاكل في الـ refresh token، رغم وجود الكوكي في المتصفح.

## الحل المطبق

### 1. التعامل مع الـ HttpOnly Cookies
- الـ refresh token يأتي من الباك إند كـ `httpOnly` cookie
- لا يمكن قراءتها من JavaScript مباشرة
- يتم إرسالها تلقائياً مع الطلبات عند استخدام `withCredentials: true`

### 2. نظام الـ Interceptor المحسن
تم إنشاء نظام شامل في `AuthServices` يتضمن:

#### أ. Response Interceptor
- يراقب جميع الاستجابات من الباك إند
- عند استلام خطأ 401 (غير مصرح)، يحاول تجديد الـ token تلقائياً
- يمنع الطلبات المتعددة المتزامنة للـ refresh

#### ب. Queue System
- إذا كان هناك طلب refresh قيد التنفيذ، يتم إضافة الطلبات الأخرى إلى قائمة انتظار
- بعد نجاح الـ refresh، يتم إعادة تنفيذ جميع الطلبات المعلقة

#### ج. Automatic Token Update
- عند نجاح الـ refresh، يتم تحديث الـ token في جميع الخدمات تلقائياً
- يتم إعادة تنفيذ الطلب الأصلي بالـ token الجديد

### 3. الخدمات المحدثة

#### AuthServices.ts
```typescript
// إضافة interceptor للتعامل التلقائي مع الـ refresh
private setupInterceptors() {
  this.axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // التعامل مع خطأ 401 وتجديد الـ token تلقائياً
    }
  );
}

// دالة تجديد الـ token
async refreshToken() {
  // لا نحتاج لإرسال الـ refresh token يدوياً
  // المتصفح يرسله تلقائياً مع الـ httpOnly cookie
}
```

#### InstructorService.ts, UserService.ts, AdminService.ts
```typescript
// استخدام الـ axios instance المحسن من AuthServices
constructor(token: string) {
  this.authService = new AuthServices();
  this.axiosInstance = this.authService.getAxiosInstance();
}

// دالة لتحديث الـ token عند تغييره
updateToken(newToken: string) {
  this.token = newToken;
  this.axiosInstance.defaults.headers["Authorization"] = newToken;
}
```

### 4. ServiceFactory الجديد
تم إنشاء `ServiceFactory` لإدارة جميع الخدمات بشكل موحد:

```javascript
import serviceFactory, { ensureAuthentication } from '../utils/serviceFactory';

// استخدام ServiceFactory
const instructorService = serviceFactory.getInstructorService();
const userService = serviceFactory.getUserService();
const adminService = serviceFactory.getAdminService();

// التأكد من المصادقة قبل إجراء الطلبات
const isAuthenticated = await ensureAuthentication();
if (isAuthenticated) {
  // إجراء الطلبات
}
```

### 5. أدوات التشخيص
تم إنشاء أدوات تشخيص شاملة في `tokenUtils.js`:

```javascript
import { debugAuthentication, formatTimeUntilExpiration } from '../utils/tokenUtils';

// تشخيص حالة المصادقة
debugAuthentication(token);

// عرض الوقت المتبقي لانتهاء صلاحية الـ token
console.log("Time until expiration:", formatTimeUntilExpiration(token));
```

### 6. المكونات المحدثة

#### DashboardInstructor.jsx
```javascript
import serviceFactory, { ensureAuthentication } from '../utils/serviceFactory';

useEffect(() => {
  const fetchInstructorData = async () => {
    try {
      // التأكد من المصادقة قبل إجراء الطلبات
      const isAuthenticated = await ensureAuthentication();
      if (!isAuthenticated) {
        navigate("/auth/login");
        return;
      }

      // الحصول على الخدمة مع الـ token الصحيح
      const instructorService = serviceFactory.getInstructorService();
      const response = await instructorService.getAllGroups();
    } catch (err) {
      // التعامل مع الأخطاء
    }
  };
}, []);
```

## المميزات الجديدة

### 1. التعامل التلقائي مع انتهاء صلاحية الـ Token
- لا يحتاج المستخدم للتدخل عند انتهاء صلاحية الـ token
- يتم التجديد تلقائياً في الخلفية

### 2. منع الطلبات المتعددة
- نظام قائمة انتظار يمنع إرسال طلبات refresh متعددة
- تحسين الأداء وتقليل الحمل على الباك إند

### 3. التعامل الآمن مع الـ HttpOnly Cookies
- لا محاولة لقراءة الـ refresh token من JavaScript
- الاعتماد على المتصفح لإرسال الـ cookies تلقائياً

### 4. إعادة توجيه ذكي
- عند فشل الـ refresh، يتم إعادة توجيه المستخدم لصفحة الدخول
- رسائل خطأ واضحة للمستخدم

### 5. ServiceFactory موحد
- إدارة مركزية لجميع الخدمات
- تحديث تلقائي للـ tokens في جميع الخدمات
- واجهة موحدة للتعامل مع المصادقة

### 6. أدوات تشخيص متقدمة
- تشخيص شامل لحالة المصادقة
- عرض معلومات مفصلة عن الـ tokens
- أدوات لاستكشاف الأخطاء

## كيفية الاستخدام

### للمطورين

#### الطريقة القديمة (لا تزال تعمل):
```javascript
import AuthServices from '../classes/Auth';
import InstructorService from '../classes/InstructorService';

const authService = new AuthServices();
const instructorService = new InstructorService(token);
```

#### الطريقة الجديدة (مفضلة):
```javascript
import serviceFactory, { ensureAuthentication } from '../utils/serviceFactory';

// التأكد من المصادقة
const isAuthenticated = await ensureAuthentication();

// الحصول على الخدمات
const instructorService = serviceFactory.getInstructorService();
const userService = serviceFactory.getUserService();
const adminService = serviceFactory.getAdminService();
```

#### استخدام أدوات التشخيص:
```javascript
import { debugAuthentication, formatTimeUntilExpiration } from '../utils/tokenUtils';

// في وضع التطوير فقط
if (import.meta.env.DEV) {
  debugAuthentication(token);
  console.log("Token expires in:", formatTimeUntilExpiration(token));
}
```

### للمستخدمين
- لا حاجة لتدخل إضافي
- النظام يعمل تلقائياً في الخلفية
- عند انتهاء الجلسة، سيتم إعادة توجيهك لصفحة الدخول

## ملاحظات مهمة

1. **withCredentials: true** - ضروري لإرسال الـ httpOnly cookies
2. **CORS** - يجب أن يكون الباك إند مهيأ لقبول الـ credentials
3. **SameSite** - يجب أن تكون الـ cookies مهيأة بشكل صحيح للـ same-site requests
4. **ServiceFactory** - يفضل استخدامه بدلاً من إنشاء الخدمات مباشرة

## استكشاف الأخطاء

### إذا لم يعمل الـ refresh:

#### 1. تحقق من إعدادات الباك إند:
```javascript
// في الباك إند، تأكد من:
app.use(cors({
  origin: 'http://localhost:3000', // أو domain الخاص بك
  credentials: true // مهم جداً
}));

// عند إرسال الـ cookies:
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

#### 2. استخدم أدوات التشخيص:
```javascript
import { debugAuthentication, debugCookies } from '../utils/tokenUtils';

// في console المتصفح
debugAuthentication(token);
debugCookies();
```

#### 3. تحقق من console للرسائل:
- "Token refreshed successfully" - نجح التجديد
- "Authentication failed" - فشل المصادقة
- "Refresh token not available" - لا يوجد refresh token

#### 4. تحقق من Network tab:
- تأكد من إرسال الـ cookies مع الطلبات
- تحقق من استجابة الـ refresh endpoint

## الملفات المحدثة

1. `src/classes/Auth.ts` - نظام الـ interceptor المحسن
2. `src/classes/InstructorService.ts` - استخدام الـ axios المحسن
3. `src/classes/UserService.ts` - استخدام الـ axios المحسن
4. `src/classes/AdminService.ts` - استخدام الـ axios المحسن
5. `src/DashboardInstructor/DashboardInstructor.jsx` - استخدام ServiceFactory
6. `src/utils/tokenUtils.js` - أدوات التشخيص
7. `src/utils/serviceFactory.js` - إدارة موحدة للخدمات

## الانتقال التدريجي

يمكن الانتقال تدريجياً للنظام الجديد:

1. استخدم ServiceFactory في المكونات الجديدة
2. احتفظ بالطريقة القديمة للمكونات الموجودة
3. قم بتحديث المكونات تدريجياً عند الحاجة
