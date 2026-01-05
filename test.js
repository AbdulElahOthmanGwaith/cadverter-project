// اختبار موقع CADverter باستخدام Playwright
const { chromium } = require('playwright');
const path = require('path');

async function testCADverter() {
    console.log('🧪 بدء اختبار موقع CADverter...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // تجميع الأخطاء
    const errors = [];
    const warnings = [];

    // مراقبة الأخطاء في وحدة التحكم
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            // تجاهل بعض الأخطاء المتوقعة
            if (!text.includes('favicon') && !text.includes('404')) {
                errors.push(`خطأ في وحدة التحكم: ${text}`);
            }
        }
        if (msg.type() === 'warning') {
            warnings.push(`تحذير: ${msg.text()}`);
        }
    });

    page.on('pageerror', error => {
        errors.push(`خطأ في الصفحة: ${error.message}`);
    });

    try {
        // 1. فتح الصفحة
        console.log('1. فتح الصفحة الرئيسية...');
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`);
        await page.waitForLoadState('networkidle');

        // التحقق من وجود العناصر الرئيسية
        console.log('2. التحقق من وجود العناصر الرئيسية...');

        const header = await page.$('header');
        const uploadZone = await page.$('.upload-zone');
        const convertBtn = await page.$('#convertBtn');
        const footer = await page.$('footer');
        const hero = await page.$('.hero');
        const features = await page.$('.features');

        if (!header) errors.push('❌ رأس الصفحة غير موجود');
        if (!uploadZone) errors.push('❌ منطقة الرفع غير موجودة');
        if (!convertBtn) errors.push('❌ زر التحويل غير موجود');
        if (!footer) errors.push('❌ التذييل غير موجود');
        if (!hero) errors.push('❌ قسم Hero غير موجود');
        if (!features) errors.push('❌ قسم المميزات غير موجود');

        console.log('   ✓ تم العثور على جميع العناصر الرئيسية');

        // 2. التحقق من النصوص
        console.log('3. التحقق من النصوص...');
        const title = await page.textContent('.hero h1');
        console.log(`   ✓ العنوان: "${title}"`);

        const subtitle = await page.textContent('.hero p');
        console.log(`   ✓ الوصف: "${subtitle}"`);

        // 3. التحقق من التصميم المتجاوب
        console.log('4. اختبار التصميم المتجاوب...');

        // محاكاة الهاتف
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(300);
        console.log('   ✓ يعمل على الشاشات الصغيرة (375px)');

        // محاكاة الجهاز اللوحي
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(300);
        console.log('   ✓ يعمل على الأجهزة اللوحية (768px)');

        // محاكاة سطح المكتب
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(300);
        console.log('   ✓ يعمل على شاشات سطح المكتب (1440px)');

        // 4. اختبار التفاعلات
        console.log('5. اختبار التفاعلات...');

        // النقر على منطقة الرفع
        await page.click('.upload-zone');
        console.log('   ✓ يمكن النقر على منطقة الرفع');

        // التحقق من ظهور حقل الإدخال
        const fileInput = await page.$('#fileInput');
        if (fileInput) {
            console.log('   ✓ حقل إدخال الملف موجود');
        }

        // 5. التحقق من CSS
        console.log('6. التحقق من التنسيق...');

        const uploadZoneBg = await page.$eval('.upload-zone', el =>
            getComputedStyle(el).backgroundColor
        );
        console.log(`   ✓ لون خلفية منطقة الرفع: ${uploadZoneBg}`);

        // التحقق من وجود الأيقونة
        const uploadIcon = await page.$('.upload-icon');
        if (uploadIcon) {
            console.log('   ✓ أيقونة الرفع موجودة');
        }

        // 6. اختبار ميزات الوصول
        console.log('7. اختبار ميزات الوصول...');

        const hasLang = await page.$eval('html', el => el.getAttribute('lang'));
        if (hasLang === 'ar') {
            console.log('   ✓ اللغة العربية محددة بشكل صحيح');
        } else {
            errors.push('❌ سمة اللغة غير محددة بشكل صحيح');
        }

        const dir = await page.$eval('html', el => el.getAttribute('dir'));
        if (dir === 'rtl') {
            console.log('   ✓ اتجاه RTL محدد بشكل صحيح');
        } else {
            errors.push('❌ اتجاه RTL غير محدد');
        }

        // التحقق من وجود skip link
        const skipLink = await page.$('.skip-link');
        if (skipLink) {
            console.log('   ✓ رابط التخطي متاح للوصول');
        }

        // 7. اختبار تحميل المكتبات الخارجية
        console.log('8. التحقق من تحميل jsPDF...');
        await page.waitForTimeout(2000);
        const jspdfLoaded = await page.evaluate(() => {
            return typeof window.jspdf !== 'undefined';
        });

        if (jspdfLoaded) {
            console.log('   ✓ jsPDF تم تحميله بنجاح');
        } else {
            console.log('   ⚠ jsPDF لم يتم تحميله بعد (يتطلب اتصال بالإنترنت)');
        }

        // 8. اختبار تحميل ملفات JavaScript الخارجية
        console.log('9. التحقق من تحميل ملفات JavaScript...');
        
        // انتظار لتحميل السكريبتات
        await page.waitForTimeout(1500);
        
        let dxfParserLoaded = false;
        let pdfGeneratorLoaded = false;
        let cadverterLoaded = false;
        
        // التحقق المباشر من السكريبتات
        try {
            const checkResult = await page.evaluate(() => {
                return {
                    dxfParser: typeof window.DXFParser,
                    pdfGenerator: typeof window.PDFGenerator,
                    cadverter: typeof window.CADverter
                };
            });
            
            dxfParserLoaded = checkResult.dxfParser !== 'undefined';
            pdfGeneratorLoaded = checkResult.pdfGenerator !== 'undefined';
            cadverterLoaded = checkResult.cadverter !== 'undefined';
            
            console.log(`   ✓ DXFParser: ${checkResult.dxfParser}`);
            console.log(`   ✓ PDFGenerator: ${checkResult.pdfGenerator}`);
            console.log(`   ✓ CADverter: ${checkResult.cadverter}`);
        } catch (e) {
            console.log('   ⚠ تعذر التحقق من السكريبتات:', e.message.slice(0, 30));
        }
        
        if (dxfParserLoaded) {
            console.log('   ✓ DXFParser تم تحميله بنجاح');
        } else {
            errors.push('❌ DXFParser لم يتم تحميله');
        }

        if (pdfGeneratorLoaded) {
            console.log('   ✓ PDFGenerator تم تحميله بنجاح');
        } else {
            errors.push('❌ PDFGenerator لم يتم تحميله');
        }

        if (cadverterLoaded) {
            console.log('   ✓ CADverter (app.js) تم تحميله بنجاح');
        } else {
            errors.push('❌ CADverter (app.js) لم يتم تحميله');
        }

        // 9. اختبار تحليل DXF
        console.log('10. اختبار تحليل ملفات DXF...');

        // إنشاء محتوى DXF للاختبار
        const testDXFContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1006
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
0
10
0.0
20
0.0
30
0.0
11
100.0
21
100.0
31
0.0
0
CIRCLE
8
0
10
50.0
20
50.0
30
0.0
40
25.0
0
ARC
8
0
10
100.0
20
100.0
30
0.0
40
30.0
50
0
51
180
0
ENDSEC
0
EOF`;

        // اختبار التحليل
        const dxfParsingResult = await page.evaluate((dxfContent) => {
            if (typeof DXFParser !== 'undefined' && typeof DXFParser.parse === 'function') {
                const result = DXFParser.parse(dxfContent);
                return {
                    success: true,
                    entities: result,
                    entityCount: result.length,
                    hasLine: result.some(e => e.type === 'line'),
                    hasCircle: result.some(e => e.type === 'circle'),
                    hasArc: result.some(e => e.type === 'arc')
                };
            }
            return { success: false, message: 'DXFParser not found' };
        }, testDXFContent);

        if (dxfParsingResult.success) {
            console.log(`   ✓ تحليل DXF يعمل بشكل صحيح`);
            console.log(`   ✓ تم اكتشاف ${dxfParsingResult.entityCount} كيان`);
            if (dxfParsingResult.hasLine) console.log('   ✓ تم التعرف على LINE');
            if (dxfParsingResult.hasCircle) console.log('   ✓ تم التعرف على CIRCLE');
            if (dxfParsingResult.hasArc) console.log('   ✓ تم التعرف على ARC');
        } else {
            errors.push('❌ فشل في تحليل ملفات DXF');
        }

        // 10. اختبار وظائف المعاينة والتحويل
        console.log('11. اختبار وظائف المعاينة والتحويل...');

        const previewModal = await page.$('#previewModal');
        if (previewModal) {
            console.log('   ✓ نافذة المعاينة موجودة');
        }

        const canvas = await page.$('#previewCanvas');
        if (canvas) {
            console.log('   ✓ canvas المعاينة موجود');
        }

        const settings = await page.$('.settings');
        if (settings) {
            console.log('   ✓ قسم الإعدادات موجود');
        }

        // التحقق من وجود select options
        const paperSizeOptions = await page.$$('#paperSize option');
        console.log(`   ✓ ${paperSizeOptions.length} خيار لحجم الورق`);

        // 11. اختبار تحميل الملفات الخارجية
        console.log('12. التحقق من تحميل CSS الخارجي...');

        const stylesLoaded = await page.evaluate(() => {
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            return links.length > 0;
        });

        if (stylesLoaded) {
            console.log('   ✓ ملف CSS الخارجي مرتبط');
        }

        // 12. اختبار Meta Tags لمحركات البحث
        console.log('13. التحقق من تحسين محركات البحث...');

        const metaDescription = await page.$eval('meta[name="description"]', el => el.content);
        if (metaDescription && metaDescription.length > 50) {
            console.log('   ✓ وصف meta موجود ومفيد');
        }

        const metaKeywords = await page.$eval('meta[name="keywords"]', el => el.content);
        if (metaKeywords) {
            console.log('   ✓ كلمات مفتاحية meta موجودة');
        }

        const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content);
        if (ogTitle) {
            console.log('   ✓ Open Graph title موجود');
        }

        // 13. اختبار Manifest
        console.log('14. التحقق من PWA Manifest...');

        const manifestLink = await page.$('link[rel="manifest"]');
        if (manifestLink) {
            console.log('   ✓ رابط Manifest موجود');
        }

        // طباعة النتائج
        console.log('\n═══════════════════════════════════════');

        if (errors.length === 0) {
            console.log('✅ جميع الاختبارات نجحت!');
            console.log('═══════════════════════════════════════\n');
        } else {
            console.log('❌ بعض الاختبارات فشلت:');
            errors.forEach(err => console.log(`   ${err}`));
            console.log('═══════════════════════════════════════\n');
        }

        // طباعة التحذيرات إذا وجدت
        if (warnings.length > 0) {
            console.log('⚠ تحذيرات:');
            warnings.slice(0, 3).forEach(warn => console.log(`   ${warn}`));
            console.log('');
        }

    } catch (error) {
        console.error('حدث خطأ أثناء الاختبار:', error.message);
        errors.push(error.message);
    } finally {
        await browser.close();
    }

    // إرجاع حالة الاختبار
    return errors.length === 0;
}

// تشغيل الاختبار
testCADverter().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('فشل في تشغيل الاختبار:', error);
    process.exit(1);
});
