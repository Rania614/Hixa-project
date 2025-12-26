# إعداد Environment Variables

## ⚠️ المشكلة:

الكونسول يظهر:
```
baseURL: https://localhost:5000/api
ERR_SSL_PROTOCOL_ERROR
```

**السبب**: localhost لا يدعم HTTPS، يجب استخدام `http://` (بدون s)

---

## ✅ الحل:

### 1. إنشاء ملف `.env.local` في `Hixa-front/`:

```bash
# في terminal
cd Hixa-front
echo VITE_API_BASE_URL=http://localhost:5000/api > .env.local
```

**أو** أنشئ الملف يدوياً:

**اسم الملف**: `.env.local`  
**المحتوى**:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. إعادة تشغيل Vite Dev Server:

```bash
# أوقف السيرفر (Ctrl+C)
# ثم شغله مرة أخرى:
npm run dev
```

---

## 📝 ملاحظات:

### للـ Development (Local):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### للـ Production:
```
VITE_API_BASE_URL=https://hixa.onrender.com/api
```

---

## 🔍 التحقق:

بعد إعادة التشغيل، افتح Console وتحقق من:
```
🌐 HTTP Service initialized with baseURL: http://localhost:5000/api
```

**يجب أن ترى `http://` (بدون s) وليس `https://`**

---

## ⚠️ إذا استمرت المشكلة:

1. تأكد من أن الملف `.env.local` موجود في `Hixa-front/`
2. تأكد من أن المحتوى صحيح (بدون مسافات إضافية)
3. أعد تشغيل Vite Dev Server
4. امسح Cache: `Ctrl+Shift+R` (Hard Refresh)

---

**تاريخ الإنشاء**: ${new Date().toLocaleString('ar-SA')}

