// معادلات حساب الوزن حسب العمر
function calculateWeightFromAge(age, unit) {
    if (unit === 'months') {
        if (age <= 12) {
            // للأطفال حتى 12 شهرًا: الوزن (كغ) = (العمر بالأشهر + 9) / 2
            return (age + 9) / 2;
        } else {
            // للأطفال أكبر من سنة: الوزن (كغ) = 2 × العمر بالسنوات + 8
            return 2 * (age / 12) + 8;
        }
    } else {
        // للأطفال أكبر من سنة: الوزن (كغ) = 2 × العمر بالسنوات + 8
        return 2 * age + 8;
    }
}

// إدارة الوضع الليلي والنهاري
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    updateThemeButton();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeText = document.getElementById('theme-text');
    const themeIcon = document.querySelector('.theme-icon');
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        themeText.textContent = 'الوضع النهاري';
        themeIcon.textContent = '☀️';
    } else {
        themeText.textContent = 'الوضع الليلي';
        themeIcon.textContent = '🌙';
    }
}

// إدارة الطباعة
function showPrintModal() {
    document.getElementById('child-name-modal').classList.remove('hidden');
}

function hidePrintModal() {
    document.getElementById('child-name-modal').classList.add('hidden');
    document.getElementById('child-name').value = '';
}

function printPrescription() {
    const childName = document.getElementById('child-name').value || 'غير محدد';
    
    // تعبئة نموذج الطباعة
    document.getElementById('print-child-name').textContent = childName;
    document.getElementById('print-weight').textContent = document.getElementById('weight-result').textContent;
    document.getElementById('print-method').textContent = document.getElementById('method-result').textContent;
    document.getElementById('print-concentration').textContent = document.getElementById('concentration').options[document.getElementById('concentration').selectedIndex].text;
    document.getElementById('print-dose').textContent = document.getElementById('dose-result').textContent;
    document.getElementById('print-daily-max').textContent = document.getElementById('daily-max-result').textContent;
    
    // إضافة التاريخ الحالي
    const now = new Date();
    document.getElementById('print-date').textContent = now.toLocaleDateString('ar-EG');
    
    // إخفاء النافذة المنبثقة
    hidePrintModal();
    
    // الطباعة
    const printContent = document.getElementById('print-prescription');
    printContent.classList.remove('hidden');
    
    window.print();
    
    // إخفاء نموذج الطباعة بعد الانتهاء
    setTimeout(() => {
        printContent.classList.add('hidden');
    }, 500);
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة الوضع الليلي/النهاري
    initTheme();
    
    // عناصر DOM
    const weightMethod = document.getElementById('weight-method');
    const ageMethod = document.getElementById('age-method');
    const weightInput = document.getElementById('weight-input');
    const ageInput = document.getElementById('age-input');
    const doseSlider = document.getElementById('dose');
    const doseDisplay = document.getElementById('dose-display');
    const calculateBtn = document.getElementById('calculate-btn');
    const printBtn = document.getElementById('print-btn');
    const resultsSection = document.getElementById('results-section');
    const themeToggle = document.getElementById('theme-toggle');
    const confirmPrint = document.getElementById('confirm-print');
    const cancelPrint = document.getElementById('cancel-print');
    
    // أحداث زر التبديل الليلي/النهاري
    themeToggle.addEventListener('click', toggleTheme);
    
    // تحديث قيمة الجرعة المعروضة
    doseSlider.addEventListener('input', function() {
        doseDisplay.textContent = this.value;
    });
    
    // تبديل بين طرق الحساب
    weightMethod.addEventListener('change', function() {
        if (this.checked) {
            weightInput.classList.remove('hidden');
            ageInput.classList.add('hidden');
        }
    });
    
    ageMethod.addEventListener('change', function() {
        if (this.checked) {
            weightInput.classList.add('hidden');
            ageInput.classList.remove('hidden');
        }
    });
    
    // حساب الجرعة
    calculateBtn.addEventListener('click', function() {
        // التحقق من صحة الإدخال
        if (!validateInputs()) {
            return;
        }
        
        // جمع البيانات
        const method = document.querySelector('input[name="method"]:checked').value;
        const dosePerKg = parseFloat(doseSlider.value);
        const concentration = document.getElementById('concentration').value;
        
        let weight;
        if (method === 'weight') {
            weight = parseFloat(document.getElementById('weight').value);
        } else {
            const age = parseFloat(document.getElementById('age').value);
            const ageUnit = document.getElementById('age-unit').value;
            weight = calculateWeightFromAge(age, ageUnit);
        }
        
        // حساب الجرعات
        const doseMg = weight * dosePerKg;
        const maxSingleDoseMg = weight * 15;
        const maxDailyDoseMg = weight * 60;
        
        // حساب الكمية بالمليلتر
        let doseMl, maxSingleDoseMl, maxDailyDoseMl;
        
        if (concentration === '100') {
            // نقط للرضع: 100 ملغ/مل
            doseMl = doseMg / 100;
            maxSingleDoseMl = maxSingleDoseMg / 100;
            maxDailyDoseMl = maxDailyDoseMg / 100;
        } else {
            // شراب: تركيز معطى لكل 5 مل
            const concentrationValue = parseInt(concentration);
            doseMl = (doseMg / concentrationValue) * 5;
            maxSingleDoseMl = (maxSingleDoseMg / concentrationValue) * 5;
            maxDailyDoseMl = (maxDailyDoseMg / concentrationValue) * 5;
        }
        
        // عرض النتائج
        displayResults(
            method === 'weight' ? 'حسب الوزن' : 'حسب العمر',
            weight.toFixed(1),
            `${doseMg.toFixed(1)} ملغ ≈ ${doseMl.toFixed(1)} مل`,
            `${maxSingleDoseMl.toFixed(1)} مل`,
            'كل 4 إلى 6 ساعات، بحد أقصى 4 مرات يوميًا',
            `${maxDailyDoseMg.toFixed(1)} ملغ ≈ ${maxDailyDoseMl.toFixed(1)} مل / اليوم`
        );
        
        // إظهار قسم النتائج وزر الطباعة
        resultsSection.classList.remove('hidden');
        printBtn.classList.remove('hidden');
    });
    
    // أحداث الطباعة
    printBtn.addEventListener('click', showPrintModal);
    confirmPrint.addEventListener('click', printPrescription);
    cancelPrint.addEventListener('click', hidePrintModal);
    
    // التحقق من صحة الإدخال
    function validateInputs() {
        const method = document.querySelector('input[name="method"]:checked').value;
        
        if (method === 'weight') {
            const weight = document.getElementById('weight').value;
            if (!weight || weight <= 0) {
                alert('يرجى إدخال وزن صحيح');
                return false;
            }
        } else {
            const age = document.getElementById('age').value;
            if (!age || age <= 0) {
                alert('يرجى إدخال عمر صحيح');
                return false;
            }
            
            // تحذير للأطفال أقل من شهرين
            const ageUnit = document.getElementById('age-unit').value;
            if (ageUnit === 'months' && age < 2) {
                if (!confirm('تحذير: لا يُستخدم الباراسيتامول للأطفال أقل من شهرين إلا تحت إشراف طبي. هل تريد المتابعة؟')) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // عرض النتائج
    function displayResults(method, weight, dose, maxDose, timing, dailyMax) {
        document.getElementById('method-result').textContent = method;
        document.getElementById('weight-result').textContent = weight;
        document.getElementById('dose-result').textContent = dose;
        document.getElementById('max-dose-result').textContent = maxDose;
        document.getElementById('timing-result').textContent = timing;
        document.getElementById('daily-max-result').textContent = dailyMax;
    }
});