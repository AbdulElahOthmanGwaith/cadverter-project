// اختبار شامل ومفصل لموقع CADverter
const { chromium } = require('playwright');
const path = require('path');

async function comprehensiveTest() {
    console.log('🧪═══════════════════════════════════════════════════════════');
    console.log('   اختبار شامل لموقع CADverter');
    console.log('═══════════════════════════════════════════════════════════\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    const warnings = [];

    // مراقبة الأخطاء في وحدة التحكم
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()}`);
        } else if (msg.type() === 'warning') {
            warnings.push(`Warning: ${msg.text()}`);
        }
    });

    page.on('pageerror', error => {
        errors.push(`Page Error: ${error.message}`);
    });

    try {
        // 1. فتح الصفحة
        console.log('📂 [1/12] فتح الصفحة الرئيسية...');
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle', timeout: 30000 });
        console.log('   ✅ نجح فتح الصفحة\n');

        // 2. التحقق من العنوان والميتا تاغز
        console.log('🏷️  [2/12] التحقق من العنوان والميتا تاغز...');
        const title = await page.title();
        console.log(`   العنوان: "${title}"`);
        if (title.includes('CADverter')) {
            console.log('   ✅ عنوان الصفحة صحيح\n');
        } else {
            errors.push('عنوان الصفحة غير صحيح');
            console.log('   ❌ عنوان الصفحة غير صحيح\n');
        }

        // 3. التحقق من اللغة واتجاه الصفحة
        console.log('🌐 [3/12] التحقق من اللغة واتجاه الصفحة...');
        const lang = await page.$eval('html', el => el.getAttribute('lang'));
        const dir = await page.$eval('html', el => el.getAttribute('dir'));
        console.log(`   اللغة: ${lang}, الاتجاه: ${dir}`);
        if (lang === 'ar' && dir === 'rtl') {
            console.log('   ✅ اللغة العربية واتجاه RTL صحيحان\n');
        } else {
            errors.push('إعدادات اللغة غير صحيحة');
            console.log('   ❌ إعدادات اللغة غير صحيحة\n');
        }

        // 4. التحقق من وجود العناصر الرئيسية
        console.log('🔍 [4/12] التحقق من وجود العناصر الرئيسية...');
        const elements = {
            'منطقة الرفع': '#uploadZone',
            'حقل الملف': '#fileInput',
            'الإعدادات': '#settings',
            'أزرار التحويل': '#actionButtons',
            'منطقة التقدم': '#progress',
            'نتيجة التحويل': '#result',
            'قسم المميزات': '.features',
            'التذييل': 'footer'
        };

        for (const [name, selector] of Object.entries(elements)) {
            const el = await page.$(selector);
            if (el) {
                console.log(`   ✅ ${name} موجودة`);
            } else {
                errors.push(`العنصر ${name} غير موجود`);
                console.log(`   ❌ ${name} غير موجودة`);
            }
        }
        console.log();

        // 5. التحقق من تحميل الخطوط
        console.log('🔤 [5/12] التحقق من تحميل الخطوط...');
        await page.waitForTimeout(2000);
        const fontLoaded = await page.evaluate(() => {
            return document.fonts.ready.then(() => true).catch(() => false);
        });
        if (fontLoaded) {
            console.log('   ✅ تم تحميل الخطوط بنجاح\n');
        } else {
            warnings.push('قد تكون هناك مشكلة في تحميل الخطوط');
            console.log('   ⚠️ قد تكون هناك مشكلة في تحميل الخطوط\n');
        }

        // 6. التحقق من تحميل jsPDF
        console.log('📄 [6/12] التحقق من تحميل مكتبة jsPDF...');
        const jspdfLoaded = await page.evaluate(() => {
            return typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF === 'function';
        });
        if (jspdfLoaded) {
            console.log('   ✅ jsPDF تم تحميله بنجاح\n');
        } else {
            errors.push('فشل في تحميل مكتبة jsPDF');
            console.log('   ❌ jsPDF لم يتم تحميله\n');
        }

        // 7. التحقق من تحميل JSZip
        console.log('📦 [7/12] التحقق من تحميل مكتبة JSZip...');
        const jszipLoaded = await page.evaluate(() => {
            return typeof window.JSZip !== 'undefined';
        });
        if (jszipLoaded) {
            console.log('   ✅ JSZip تم تحميله بنجاح\n');
        } else {
            warnings.push('JSZip لم يتم تحميله (قد يؤثر على ميزة ZIP)');
            console.log('   ⚠️ JSZip لم يتم تحميله\n');
        }

        // 8. اختبار التفاعلات
        console.log('🖱️  [8/12] اختبار التفاعلات...');
        
        // النقر على منطقة الرفع
        await page.click('#uploadZone');
        await page.waitForTimeout(500);
        const fileInputExists = await page.$('#fileInput');
        if (fileInputExists) {
            console.log('   ✅ يمكن النقر على منطقة الرفع');
        } else {
            errors.push('مشكلة في منطقة الرفع');
            console.log('   ❌ مشكلة في منطقة الرفع');
        }

        // التحقق من وجود أزرار التحويل
        const convertBtn = await page.$('#convertBtn');
        const batchBtn = await page.$('#batchBtn');
        console.log(`   ✅ زر التحويل الفردي: ${convertBtn ? 'موجود' : 'غير موجود'}`);
        console.log(`   ✅ زر التحويل المتعدد: ${batchBtn ? 'موجود' : 'غير موجود'}\n`);

        // 9. اختبار التصميم المتجاوب
        console.log('📱 [9/12] اختبار التصميم المتجاوب...');
        
        const viewports = [
            { width: 375, height: 667, name: 'هاتف' },
            { width: 768, height: 1024, name: 'جهاز لوحي' },
            { width: 1440, height: 900, name: 'سطح مكتب' }
        ];

        for (const vp of viewports) {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.waitForTimeout(300);
            console.log(`   ✅ يعمل على ${vp.name} (${vp.width}x${vp.height})`);
        }
        console.log();

        // 10. التحقق من CSS والتنسيق
        console.log('🎨 [10/12] التحقق من CSS والتنسيق...');
        const bgColor = await page.$eval('body', el => getComputedStyle(el).backgroundColor);
        console.log(`   ✅ لون الخلفية: ${bgColor}`);
        
        const headerPosition = await page.$eval('header', el => getComputedStyle(el).position);
        console.log(`   ✅ موقع الرأس: ${headerPosition}\n`);

        // 11. التحقق من ميزات الوصول
        console.log('♿ [11/12] التحقق من ميزات الوصول...');
        
        // التحقق من تباين الألوان
        const textColor = await page.$eval('.hero h1', el => getComputedStyle(el).color);
        const bgColorHeader = await page.$eval('header', el => getComputedStyle(el).backgroundColor);
        console.log(`   ✅ لون النص: ${textColor}`);
        console.log(`   ✅ لون خلفية الرأس: ${bgColorHeader}`);
        
        // التحقق من أحجام الخطوط
        const h1FontSize = await page.$eval('.hero h1', el => getComputedStyle(el).fontSize);
        console.log(`   ✅ حجم خط العنوان: ${h1FontSize}\n`);

        // 12. التحقق من الوظائف
        console.log('⚙️  [12/12] التحقق من الوظائف الأساسية...');
        
        // التحقق من دالة showHistory
        const showHistoryExists = await page.evaluate(() => typeof showHistory === 'function');
        console.log(`   ✅ دالة showHistory: ${showHistoryExists ? 'موجودة' : 'غير موجودة'}`);
        
        // التحقق من دالة convertSingle
        const convertSingleExists = await page.evaluate(() => typeof convertSingle === 'function');
        console.log(`   ✅ دالة convertSingle: ${convertSingleExists ? 'موجود' : 'غير موجودة'}`);
        
        // التحقق من دالة convertBatch
        const convertBatchExists = await page.evaluate(() => typeof convertBatch === 'function');
        console.log(`   ✅ دالة convertBatch: ${convertBatchExists ? 'موجود' : 'غير موجودة'}`);
        
        // التحقق من دالة downloadPDF
        const downloadPDFExists = await page.evaluate(() => typeof downloadPDF === 'function');
        console.log(`   ✅ دالة downloadPDF: ${downloadPDFExists ? 'موجود' : 'غير موجودة'}`);
        
        // التحقق من دالة downloadZip
        const downloadZipExists = await page.evaluate(() => typeof downloadZip === 'function');
        console.log(`   ✅ دالة downloadZip: ${downloadZipExists ? 'موجود' : 'غير موجودة'}\n`);

        // طباعة النتائج النهائية
        console.log('═══════════════════════════════════════════════════════════');
        console.log('                       النتائج النهائية');
        console.log('═══════════════════════════════════════════════════════════\n');

        if (errors.length === 0) {
            console.log('✅ لم يتم اكتشاف أي أخطاء!');
        } else {
            console.log(`❌ عدد الأخطاء المكتشفة: ${errors.length}`);
            errors.forEach((err, i) => console.log(`   ${i+1}. ${err}`));
        }

        if (warnings.length > 0) {
            console.log(`\n⚠️  عدد التحذيرات: ${warnings.length}`);
            warnings.forEach((warn, i) => console.log(`   ${i+1}. ${warn}`));
        }

        console.log('\n═══════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.message);
        errors.push(`Test Error: ${error.message}`);
    } finally {
        await browser.close();
    }

    return { errors, warnings };
}

// تشغيل الاختبار
comprehensiveTest().then(result => {
    console.log('🏁 اكتمل الاختبار');
    process.exit(result.errors.length > 0 ? 1 : 0);
}).catch(error => {
    console.error('فشل في تشغيل الاختبار:', error);
    process.exit(1);
});