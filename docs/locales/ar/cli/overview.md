---
title: "واجهة Jigsaw لسطر الأوامر: استخرج البيانات من الطرفية"
description: "ثبّت أدوات Jigsaw للطرفية، واختر بين أوامر extract والبيئة التفاعلية وخادم MCP. اتبع الدليل المناسب لمهمتك."
---

# واجهة سطر الأوامر {#command-line-interface}

منذ الإصدار 0.3، تشمل Jigsaw واجهة قوية لسطر الأوامر توفر ثلاث إمكانات رئيسية:

1. **البيئة التفاعلية**: بيئة لاستخراج بيانات الويب مبنية على IPython، وتوفر اختصارات وأدوات مفيدة كثيرة.
2. **أوامر الاستخراج**: استخرج بيانات المواقع من الطرفية دون كتابة كود.
3. **الأوامر المساعدة**: أدوات التثبيت والإدارة.

```bash
# Launch interactive shell
jigsaw shell

# Convert the content of a page to markdown and save it to a file
jigsaw extract get "https://example.com" content.md

# Get help for any command
jigsaw --help
jigsaw extract --help
```

## المتطلبات {#requirements}

يتطلب هذا القسم تثبيت مجموعة المتطلبات الإضافية `shell` كما يلي:

```bash
pip install "jigsaw[shell]"
```

للجلب باستخدام المتصفح، ثبّت متطلبات المتصفح أيضًا:

```bash
jigsaw install
```

ينزّل هذا الأمر Chromium ومتطلبات النظام اللازمة له، ويحدّث قائمة TLD. لا تحتاج طلبات HTTP إلى هذه الخطوة.
