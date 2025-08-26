# 🤖 ChatGPT Advanced - رابط کاربری پیشرفته فارسی

یک رابط کاربری کامل و حرفه‌ای برای ChatGPT با پشتیبانی کامل از زبان فارسی و آخرین مدل‌های OpenAI.

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
[![License](https://img.shields.io/badge/license-MIT-green.svg)
[![Language](https://img.shields.io/badge/language-فارسی-orange.svg)
[![OpenAI](https://img.shields.io/badge/OpenAI-API%20v1-purple.svg)

## 🌟 ویژگی‌های کلیدی

### 🎯 مدل‌های پشتیبانی شده
- **GPT-4o** - جدیدترین و قدرتمندترین مدل با قابلیت تحلیل تصویر
- **GPT-4o Mini** - سریع، ارزان و کیفیت بالا برای استفاده روزانه  
- **GPT-4 Turbo** - نسخه بهبود یافته GPT-4 با سرعت بالا
- **GPT-4** - مدل کلاسیک با دقت بالا
- **GPT-3.5 Turbo** - مقرون‌به‌صرفه برای کاربردهای عمومی
- **o1-preview** - مدل استدلال پیشرفته برای مسائل پیچیده
- **o1-mini** - نسخه سریع‌تر مدل استدلال

### 🎨 رابط کاربری
- ✅ **طراحی فارسی و RTL** - کاملاً بهینه‌سازی شده برای فارسی
- ✅ **تم‌های متنوع** - روشن، تاریک، کنتراست بالا، خودکار
- ✅ **واکنش‌گرا** - سازگار با موبایل، تبلت و دسکتاپ
- ✅ **دسترسی‌پذیر** - پشتیبانی از Screen Reader و کیبورد
- ✅ **انیمیشن‌های هموار** - تجربه کاربری بهینه

### ⚡ قابلیت‌های پیشرفته
- 🔄 **استریمینگ Real-time** - دریافت پاسخ‌ها به صورت زنده
- 📁 **آپلود فایل** - پشتیبانی از تصاویر، اسناد و فایل‌های متنی
- 🎤 **ورودی صوتی** - تبدیل گفتار به متن
- 💾 **مدیریت گفتگو** - ذخیره، بارگذاری و صادرات گفتگوها
- 🔍 **جستجوی پیشرفته** - جستجو در تاریخچه گفتگوها
- 📊 **نمایش کد و ریاضی** - پشتیبانی از Syntax Highlighting و MathJax

### ⚙️ تنظیمات پیشرفته
- 🎛️ **کنترل پارامترها** - Temperature, Top-p, Presence/Frequency Penalty
- 📏 **مدیریت توکن** - کنترل حداکثر توکن‌ها و هزینه
- 🔐 **امنیت** - ذخیره امن کلید API
- 🌍 **چندزبانه** - پشتیبانی از زبان‌های مختلف

## 🚀 نصب و راه‌اندازی

### نیازمندی‌ها
- مرورگر مدرن (Chrome, Firefox, Safari, Edge)
- [کلید API معتبر از [OpenAI](https://platform.openai.com/api-keys)
- سرور وب (اختیاری برای توسعه محلی)

### روش 1: استفاده مستقیم
1. فایل‌ها را دانلود کنید
2. فایل `index.html` را در مرورگر باز کنید
3. کلید API خود را وارد کنید

### روش 2: سرور محلی
```bash
# استفاده از Python
python -m http.server 8000

# استفاده از Node.js
npx serve .

# استفاده از PHP
php -S localhost:8000

سپس به `http://localhost:8000` بروید.

## 📁 ساختار پروژه


ChatGPT-Advanced/
├── index.html              # صفحه اصلی
├── styles/                 # فایل‌های CSS
│   ├── main.css           # استایل‌های اصلی
│   ├── themes.css         # تم‌ها و رنگ‌ها
│   └── responsive.css     # طراحی واکنش‌گرا
├── scripts/               # فایل‌های JavaScript
│   ├── main.js           # کلاس اصلی برنامه
│   ├── api.js            # مدیریت API
│   ├── ui.js             # رابط کاربری
│   └── utils.js          # توابع کمکی
├── config/                # تنظیمات
│   └── models.json       # اطلاعات مدل‌ها
└── README.md             # راهنمای پروژه

## 🔧 پیکربندی

### تنظیم کلید API
1. روی آیکون تنظیمات کلیک کنید
2. در تب "API" کلید خود را وارد کنید
3. روی "تست اتصال" کلیک کنید تا اعتبار آن بررسی شود

### انتخاب مدل
- برای استفاده روزانه: **GPT-4o Mini** (توصیه شده)
- برای کار حرفه‌ای: **GPT-4o**
- برای مسائل پیچیده: **o1-preview**
- برای هزینه کم: **GPT-3.5 Turbo**

### تنظیم پارامترها

#### Temperature (دما)
- `0.0` - پاسخ‌های قطعی و ثابت
- `1.0` - تعادل (پیش‌فرض)  
- `2.0` - خلاقانه و متنوع

#### Top-p
- کنترل تنوع کلمات انتخابی
- مقدار پیش‌فرض: `1.0`

#### Max Tokens
- حداکثر طول پاسخ
- برای پاسخ‌های بلند: 4000+
- برای پاسخ‌های کوتاه: 500-1000

## 💡 نحوه استفاده

### گفتگوی پایه
1. پیام خود را تایپ کنید
2. Enter یا کلیک روی دکمه ارسال
3. منتظر پاسخ بمانید

### آپلود فایل
1. روی آیکون کلیپ کلیک کنید
2. فایل مورد نظر را انتخاب کنید
3. توضیح درباره فایل بنویسید

### ورودی صوتی
1. روی آیکون میکروفون کلیک کنید
2. اجازه دسترسی به میکروفون را بدهید
3. صحبت کنید تا متن تبدیل شود

### میانبرهای کیبورد
- `Ctrl + Enter` - ارسال پیام
- `Ctrl + N` - گفتگوی جدید
- `Ctrl + S` - صادرات گفتگو
- `Ctrl + K` - جستجو در گفتگوها
- `Alt + T` - تغییر تم
- `Alt + S` - باز/بسته کردن منو
- `Ctrl + /` - راهنما

## 🎨 سفارشی‌سازی

### اضافه کردن تم جدید
در فایل `styles/themes.css`:

css
[data-theme="custom"] {
  --primary-color: #your-color;
  --background-color: #your-bg;
  --text-color: #your-text;
  /* سایر متغیرها */
}

### تغییر فونت
در فایل `styles/main.css`:

css
:root {
  --font-primary: 'فونت-دلخواه', 'IRANSans', sans-serif;
}

### افزودن مدل جدید
در فایل `config/models.json`:

json
{
  "your-model": {
    "id": "your-model-id",
    "name": "نام مدل",
    "description": "توضیحات",
    "capabilities": { ... },
    "limits": { ... }
  }
}

## 🔒 امنیت و حریم خصوصی

- ✅ کلید API فقط در مرورگر شما ذخیره می‌شود
- ✅ هیچ داده‌ای به سرور ما ارسال نمی‌شود
- ✅ تمام گفتگوها محلی ذخیره می‌شوند
- ✅ قابلیت پاکسازی کامل داده‌ها
- ⚠️ از کلید API خود محافظت کنید
- ⚠️ در کامپیوترهای عمومی احتیاط کنید

## 🐛 رفع مشکلات

### مشکلات رایج

**خطای API Key نامعتبر:**
- کلید را مجدد بررسی کنید
- اطمینان حاصل کنید که حساب شما اعتبار دارد

**عدم نمایش پاسخ:**
- اتصال اینترنت را بررسی کنید
- Console مرورگر را چک کنید (F12)

**مشکل در آپلود فایل:**
- اندازه فایل را بررسی کنید (حداکثر 10MB)
- فرمت فایل پشتیبانی شده باشد

**مشکل ورودی صوتی:**
- اجازه دسترسی به میکروفون را بدهید
- مرورگر شما از Web Speech پشتیبانی کند

### گزارش مشکل
اگر مشکلی پیدا کردید:
1. Console مرورگر را باز کنید (F12)
2. خطاها را کپی کنید
3. مشکل را گزارش دهید

## 🔄 به‌روزرسانی

برای به‌روزرسانی:
1. فایل‌های جدید را دانلود کنید
2. فایل‌های قدیمی را جایگزین کنید
3. Cache مرورگر را پاک کنید (Ctrl + F5)

## 🤝 مشارکت

### نحوه مشارکت
1. پروژه را Fork کنید
2. تغییرات خود را اعمال کنید
3. Pull Request ایجاد کنید

### راهنمای توسعه
bash
# کلون کردن پروژه
git clone [repository-url]

# نصب dependencies (در صورت نیاز)
npm install

# اجرای سرور توسعه
npm start

### استانداردهای کد
- از فارسی برای نام متغیرها استفاده کنید
- کامنت‌ها به فارسی باشند
- از camelCase برای JavaScript
- از kebab-case برای CSS

## 📞 پشتیبانی

### راه‌های تماس
- **ایمیل**: [your-email@example.com]
- **تلگرام**: [@your-telegram]
- **وب‌سایت**: [your-website.com]

### منابع مفید
-[ [مستندات OpenAI API](https://platform.openai.com/docs)
-[ [راهنمای JavaScript](https://developer.mozilla.org/fa/)
-[ [آموزش CSS Grid/Flexbox](https://css-tricks.com/)

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر فایل LICENSE را مطالعه کنید.


MIT License

Copyright (c) 2024 ChatGPT Advanced

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🎯 نقشه راه

### نسخه 2.2 (در دست توسعه)
- [ ] پشتیبانی از پلاگین‌ها
- [ ] صادرات به PDF
- [ ] تم‌های بیشتر
- [ ] پشتیبانی از Markdown پیشرفته

### نسخه 2.3 (برنامه‌ریزی شده)
- [ ] PWA (Progressive Web App)
- [ ] پشتیبانی آفلاین محدود
- [ ] سیستم یادآوری
- [ ] آمار استفاده

### ایده‌های آینده
- [ ] اتصال به پایگاه داده
- [ ] چت گروهی
- [ ] ربات تلگرام
- [ ] اپلیکیشن موبایل

## 🙏 تشکر ویژه

از افراد و سازمان‌های زیر تشکر می‌کنیم:
- **OpenAI** برای ارائه API قدرتمند
- **Mozilla Developer Network** برای مستندات عالی
- **جامعه توسعه‌دهندگان فارسی** برای حمایت و بازخورد
- **تمام کاربرانی** که با بازخورد خود به بهبود این پروژه کمک کردند

## 🌟 ستاره بدهید!

اگر این پروژه برایتان مفید بود، حتماً ستاره بدهید! ⭐

---

**ساخته شده با ❤️ برای جامعه فارسی‌زبان**

*آخرین به‌روزرسانی: ۴ شهریور ۱۴۰۴ (۲۶ آگوست ۲۰۲۵)*


## 🎯 خلاصه فایل‌های config و README

### 📁 config/models.json
فایل جامع شامل:
- **اطلاعات کامل ۶ مدل** OpenAI با جزئیات فنی
- **قابلیت‌ها و محدودیت‌ها** هر مدل
- **قیمت‌گذاری دقیق** و پارامترهای قابل تنظیم
- **توصیه‌های استفاده** و نکات بهینه‌سازی
- **دسته‌بندی مدل‌ها** بر اساس کاربرد
- **بهینه‌سازی ویژه برای فارسی**
- **متادیتا و اطلاعات نسخه**

### 📁 README.md  
راهنمای کامل شامل:
- **معرفی پروژه** و ویژگی‌های کلیدی
- **راهنمای نصب** و راه‌اندازی گام‌به‌گام
- **ساختار پروژه** و توضیح فایل‌ها
- **نحوه استفاده** از تمام قابلیت‌ها
- **میانبرهای کیبورد** و نکات کاربردی
- **راهنمای سفارشی‌سازی** و توسعه
- **رفع مشکلات** و پشتیبانی
- **مجوز و اطلاعات حقوقی**
- **نقشه راه** و برنامه‌های آینده

### ✨ ویژگی‌های برجسته:
- **مستندات کامل فارسی** با جزئیات فنی
- **راهنمای کاربردی** برای همه سطوح کاربران
- **اطلاعات به‌روز** از آخرین مدل‌های OpenAI
- **نکات بهینه‌سازی** برای زبان فارسی
- **پشتیبانی جامع** و راه‌های تماس

این فایل‌ها پایه‌ای محکم برای استقرار و نگهداری پروژه ChatGPT Advanced فراهم می‌کنند! 🚀