/**
 * CADverter - Multi-language Translations
 * ترجمات الموقع باللغة العربية والإنجليزية
 * Version: 2.0.0
 */

const translations = {
    ar: {
        // General
        appName: 'CADverter',
        tagline: 'حوّل ملفات CAD إلى PDF بسهولة',
        subtitle: 'محول سريع وآمن يدعم DWG و DXF مع عرض وتحجيم تلقائي للمخططات الهندسية',
        
        // Header
        history: 'سجل التحويلات',
        
        // Upload Zone
        dragDrop: 'اسحب ملفات CAD到这里',
        clickToSelect: 'أو انقر لتحديد الملفات من جهازك',
        supportedFormats: 'الملفات المدعومة: DWG, DXF',
        formatDWG: 'DWG',
        formatDXF: 'DXF',
        premium: 'محول PDF',
        
        // Files List
        selectedFiles: 'الملفات المختارة',
        filesCount: 'ملف',
        filesCountPlural: 'ملفات',
        removeAll: 'إزالة الكل',
        remove: 'إزالة',
        preview: 'معاينة',
        
        // Settings
        settingsTitle: 'إعدادات التحويل',
        paperSize: 'حجم الورق',
        orientation: 'الاتجاه',
        scale: 'المقياس',
        quality: 'جودة PDF',
        colorMode: 'وضع الألوان',
        
        // Paper sizes
        a4: 'A4 (210 × 297 ملم)',
        a3: 'A3 (297 × 420 ملم)',
        a2: 'A2 (420 × 594 ملم)',
        a1: 'A1 (594 × 841 ملم)',
        letter: 'Letter (8.5 × 11 بوصة)',
        legal: 'Legal (8.5 × 14 بوصة)',
        
        // Orientation
        portrait: 'عمودي',
        landscape: 'أفقي',
        
        // Scale
        autoScale: 'تلقائي (ملء الصفحة)',
        scale100: '100% (الحجم الأصلي)',
        scale75: '75%',
        scale50: '50%',
        scale25: '25%',
        scaleInfo: 'المقياس التلقائي: سيقوم بتكبير/تصغير المخطط ليناسب الصفحة المحددة تماماً مع الحفاظ على النسب',
        scalePercentInfo: 'مقياس {percent}%: سيتم رسم المخطط بنسبة {percent}% من حجمه الأصلي',
        
        // Quality
        high: 'عالية',
        medium: 'متوسطة',
        low: 'منخفضة',
        
        // Color Mode
        color: 'ملون',
        grayscale: 'أبيض وأسود',
        blackOnly: 'أسود فقط',
        
        // Buttons
        previewBtn: 'معاينة',
        convertBtn: 'تحويل إلى PDF',
        batchConvert: 'تحويل الكل',
        download: 'تحميل',
        downloadZip: 'تحميل ZIP',
        downloadAsZip: 'تحميل كملف مضغوط',
        newFiles: 'تحويل ملفات أخرى',
        close: 'إغلاق',
        
        // Progress
        converting: 'جاري التحويل...',
        batchConverting: 'جاري تحويل الملفات المتعددة...',
        processing: 'جاري معالجة: ',
        fileOf: 'ملف {current} من {total}',
        
        // Result
        success: 'تم التحويل بنجاح!',
        multipleSuccess: 'تم تحويل {count} ملفات بنجاح!',
        downloadMsg: 'يمكنك تحميل الملف أو جميع الملفات كملف مضغوط',
        downloadZipMsg: 'يمكنك تحميل جميع الملفات كملف مضغوط واحد',
        
        // Features
        featuresTitle: 'مميزاتنا',
        fastSpeed: 'سرعة فائقة',
        fastSpeedDesc: 'تحويل فوري في المتصفح دون الحاجة لرفع الملفات للخادم. يدعم الملفات الكبيرة بكفاءة',
        security: 'أمان وخصوصية',
        securityDesc: 'جميع العمليات تتم محلياً في متصفحك. لا يتم رفع ملفاتك لأي خادم. 100% خصوصية',
        previewFeature: 'معاينة فورية',
        previewFeatureDesc: 'شاهد مخططاتك قبل التحويل مع إمكانية التكبير والتصغير والتحريك',
        arabicSupport: 'دعم عربي كامل',
        arabicSupportDesc: 'واجهة عربية كاملة مع دعم النصوص العربية في المخططات',
        
        // Info Banner
        infoTitle: 'يدعم الآن ملفات DXF فقط',
        infoText: 'نقوم حالياً بتطوير المحرك ليدعم ملفات DWG الأصلية. للمخططات بصيغة DWG، يرجى تصديرها إلى DXF أولاً أو جرب المعاينة التجريبية',
        
        // Drawing Preview
        drawingPreview: 'مخطط هندسي',
        dwgPreviewNote: 'ملفات DWG تُعرض كبيانات تجريبية. للحصول على أفضل النتائج، يُفضل استخدام صيغة DXF.',
        
        // Preview Modal
        previewTitle: 'معاينة المخطط',
        dimensions: 'الأبعاد',
        entities: 'العناصر',
        zoom: 'تكبير',
        resetZoom: 'إعادة تعيين',
        convertToPdf: 'تحويل إلى PDF',
        
        // History
        historyTitle: 'سجل التحويلات',
        noHistory: 'لا توجد تحويلات سابقة',
        clearHistory: 'مسح السجل',
        
        // Footer
        footerText: 'جميع العمليات تتم محلياً. ملفاتك آمنة 100%',
        privacyNote: 'جميع العمليات تتم محلياً. ملفاتك آمنة 100%',
        
        // Loading
        loadingPreview: 'جاري تحميل المعاينة...',
        
        // Accessibility
        skipLink: 'انتقل إلى المحتوى الرئيسي',
        
        // Tooltips
        dimensions: 'الأبعاد',
        entities: 'العناصر',
        
        // Error Messages
        errorDwgDxfOnly: 'يرجى اختيار ملفات DWG أو DXF فقط',
        errorFileTooBig: 'الملف {name} كبير جداً (حد أقصى 100 ميجابايت)',
        errorReading: 'خطأ في قراءة الملف',
        errorConversion: 'حدث خطأ: {error}',
        errorLoadingLib: 'جاري تحميل مكتبة الضغط...',
        errorLoadingLibFailed: 'فشل في تحميل مكتبة الضغط. يرجى التحقق من اتصال الإنترنت.',
        errorCreatingZip: 'خطأ في إنشاء ملف ZIP: {error}',
        
        // ZIP Download
        loadingLib: 'جاري تحميل مكتبة الضغط...',
        creatingZip: 'جاري إنشاء ملف ZIP...',
        compressingFiles: 'جاري الضغط: {percent}%',
        downloadAsZip: 'تحميل كملف مضغوط',
        
        // History items
        dateFormat: 'ar-EG',
        
        // Units
        units: {
            bytes: 'Bytes',
            kb: 'KB',
            mb: 'MB',
            gb: 'GB'
        }
    },
    
    en: {
        // General
        appName: 'CADverter',
        tagline: 'Convert CAD files to PDF easily',
        subtitle: 'Fast and secure converter supporting DWG and DXF with automatic preview and scaling of engineering drawings',
        
        // Header
        history: 'Conversion History',
        
        // Upload Zone
        dragDrop: 'Drag CAD files here',
        clickToSelect: 'Or click to select files from your device',
        supportedFormats: 'Supported files: DWG, DXF',
        formatDWG: 'DWG',
        formatDXF: 'DXF',
        premium: 'PDF Converter',
        
        // Files List
        selectedFiles: 'Selected Files',
        filesCount: 'file',
        filesCountPlural: 'files',
        removeAll: 'Remove All',
        remove: 'Remove',
        preview: 'Preview',
        
        // Settings
        settingsTitle: 'Conversion Settings',
        paperSize: 'Paper Size',
        orientation: 'Orientation',
        scale: 'Scale',
        quality: 'PDF Quality',
        colorMode: 'Color Mode',
        
        // Paper sizes
        a4: 'A4 (210 × 297 mm)',
        a3: 'A3 (297 × 420 mm)',
        a2: 'A2 (420 × 594 mm)',
        a1: 'A1 (594 × 841 mm)',
        letter: 'Letter (8.5 × 11 in)',
        legal: 'Legal (8.5 × 14 in)',
        
        // Orientation
        portrait: 'Portrait',
        landscape: 'Landscape',
        
        // Scale
        autoScale: 'Auto (Fill Page)',
        scale100: '100% (Original Size)',
        scale75: '75%',
        scale50: '50%',
        scale25: '25%',
        scaleInfo: 'Auto scale: Will zoom the drawing to fit the selected page exactly while maintaining proportions',
        scalePercentInfo: 'Scale {percent}%: The drawing will be rendered at {percent}% of its original size',
        
        // Quality
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        
        // Color Mode
        color: 'Color',
        grayscale: 'Grayscale',
        blackOnly: 'Black Only',
        
        // Buttons
        previewBtn: 'Preview',
        convertBtn: 'Convert to PDF',
        batchConvert: 'Convert All',
        download: 'Download',
        downloadZip: 'Download ZIP',
        downloadAsZip: 'Download as ZIP',
        newFiles: 'Convert More Files',
        close: 'Close',
        
        // Progress
        converting: 'Converting...',
        batchConverting: 'Converting multiple files...',
        processing: 'Processing: ',
        fileOf: 'File {current} of {total}',
        
        // Result
        success: 'Conversion successful!',
        multipleSuccess: '{count} files converted successfully!',
        downloadMsg: 'You can download the file or all files as a ZIP archive',
        downloadZipMsg: 'You can download all files as a single ZIP archive',
        
        // Features
        featuresTitle: 'Our Features',
        fastSpeed: 'Lightning Fast',
        fastSpeedDesc: 'Instant conversion in the browser without uploading files to the server. Supports large files efficiently',
        security: 'Secure & Private',
        securityDesc: 'All operations happen locally in your browser. Your files are never uploaded to any server. 100% privacy',
        previewFeature: 'Instant Preview',
        previewFeatureDesc: 'View your drawings before conversion with zoom, pan, and resize capabilities',
        arabicSupport: 'Full Arabic Support',
        arabicSupportDesc: 'Complete Arabic interface with support for Arabic text in drawings',
        
        // Info Banner
        infoTitle: 'Now supports DXF files only',
        infoText: 'We are currently developing the engine to support native DWG files. For DWG drawings, please export to DXF first or try the preview demo',
        
        // Drawing Preview
        drawingPreview: 'Engineering Drawing',
        dwgPreviewNote: 'DWG files are displayed as sample data. For best results, it is recommended to use DXF format.',
        
        // Preview Modal
        previewTitle: 'Drawing Preview',
        dimensions: 'Dimensions',
        entities: 'Entities',
        zoom: 'Zoom',
        resetZoom: 'Reset',
        convertToPdf: 'Convert to PDF',
        
        // History
        historyTitle: 'Conversion History',
        noHistory: 'No previous conversions',
        clearHistory: 'Clear History',
        
        // Footer
        footerText: 'All operations are local. Your files are 100% secure',
        privacyNote: 'All operations are local. Your files are 100% secure',
        
        // Loading
        loadingPreview: 'Loading preview...',
        
        // Accessibility
        skipLink: 'Skip to main content',
        
        // Tooltips
        dimensions: 'Dimensions',
        entities: 'Entities',
        
        // Error Messages
        errorDwgDxfOnly: 'Please select DWG or DXF files only',
        errorFileTooBig: 'File {name} is too large (maximum 100 MB)',
        errorReading: 'Error reading file',
        errorConversion: 'An error occurred: {error}',
        errorLoadingLib: 'Loading compression library...',
        errorLoadingLibFailed: 'Failed to load compression library. Please check your internet connection.',
        errorCreatingZip: 'Error creating ZIP file: {error}',
        
        // ZIP Download
        loadingLib: 'Loading compression library...',
        creatingZip: 'Creating ZIP file...',
        compressingFiles: 'Compressing: {percent}%',
        downloadAsZip: 'Download as ZIP',
        
        // History items
        dateFormat: 'en-US',
        
        // Units
        units: {
            bytes: 'Bytes',
            kb: 'KB',
            mb: 'MB',
            gb: 'GB'
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}

// Export to window for browser usage
if (typeof window !== 'undefined') {
    window.translations = translations;
}
