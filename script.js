// ===== ДАННЫЕ =====
const symptomsData = [
    { title: "Головная боль", icon: "🧠", steps: ["Выпить воду", "Принять обезболивающее", "Отдохнуть"] },
    { title: "Кашель", icon: "🫁", steps: ["Тёплое молоко", "Ингаляции", "Покой"] },
    { title: "Температура", icon: "🌡️", steps: ["Измерить температуру", "Принять жаропонижающее", "Постельный режим"] },
    { title: "Боль в горле", icon: "🩺", steps: ["Полоскать горло", "Пить тёплый чай", "Отдых"] },
    { title: "Боль в животе", icon: "🤢", steps: ["Тёплая вода", "Диета", "Покой"] },
    { title: "Аллергия", icon: "🤧", steps: ["Принять антигистаминное", "Проветрить", "Избегать аллергена"] }
];

let currentUser = localStorage.getItem('healthUser') || '';
let notes = JSON.parse(localStorage.getItem('healthNotes')) || [];
let isDark = localStorage.getItem('healthTheme') === 'dark';
let completedSymptoms = JSON.parse(localStorage.getItem('completedSymptoms')) || [];
let symptomLog = JSON.parse(localStorage.getItem('symptomLog')) || [];
let moodLog = JSON.parse(localStorage.getItem('moodLog')) || [];
let treatmentChecks = [];

// ===== DOM =====
const splash = document.getElementById('splashScreen');
const registerScreen = document.getElementById('registerScreen');
const appScreen = document.getElementById('appScreen');
const userNameInput = document.getElementById('userNameInput');
const registerBtn = document.getElementById('registerBtn');
const greetingText = document.getElementById('greetingText');
const settingsUserName = document.getElementById('settingsUserName');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleSettings = document.getElementById('themeToggleSettings');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const symptomsList = document.getElementById('symptomsList');
const symptomsCount = document.getElementById('symptomsCount');
const notesList = document.getElementById('notesList');
const addNoteBtn = document.getElementById('addNoteBtn');
const treatmentSelect = document.getElementById('treatmentSelect');
const treatmentSteps = document.getElementById('treatmentSteps');
const completeBtn = document.getElementById('completeTreatmentBtn');
const resetBtn = document.getElementById('resetProgressBtn');
const treatmentProgress = document.getElementById('treatmentProgress');

// ===== ТЕМА =====
function applyTheme() {
    document.body.classList.toggle('dark', isDark);
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
    themeToggleSettings.textContent = isDark ? '☀️ Светлая' : '🌙 Тёмная';
    localStorage.setItem('healthTheme', isDark ? 'dark' : 'light');
}

// ===== ЭКРАНЫ =====
function showRegister() {
    registerScreen.style.display = 'flex';
    appScreen.style.display = 'none';
}

function showApp() {
    registerScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    greetingText.textContent = `Привет, ${currentUser} 👋`;
    settingsUserName.textContent = currentUser;
    renderSymptoms();
    renderNotes();
    loadTreatmentSelect();
    updateTreatmentProgress();
    renderAnalytics();
    renderMoodLog();
}

// ===== РЕГИСТРАЦИЯ =====
registerBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (name) {
        currentUser = name;
        localStorage.setItem('healthUser', name);
        showApp();
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser = '';
    localStorage.removeItem('healthUser');
    showRegister();
});

themeToggleBtn.addEventListener('click', () => { isDark = !isDark; applyTheme(); });
themeToggleSettings.addEventListener('click', () => { isDark = !isDark; applyTheme(); });

// ===== СИМПТОМЫ =====
function renderSymptoms(filter = '') {
    const filtered = symptomsData.filter(s => s.title.toLowerCase().includes(filter.toLowerCase()));
    symptomsCount.textContent = `Найдено: ${filtered.length} из ${symptomsData.length}`;
    symptomsList.innerHTML = filtered.map((s, i) => {
        const isCompleted = completedSymptoms.includes(s.title);
        return `
            <div class="symptom-item" data-index="${i}">
                <h3>${s.icon} ${s.title} ${isCompleted ? '✅' : ''}</h3>
                <p>Кликни, чтобы увидеть шаги</p>
                <div class="steps">
                    ${s.steps.map(step => `<span>${isCompleted ? '✅' : '➡️'} ${step}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
    document.querySelectorAll('.symptom-item').forEach(item => {
        item.addEventListener('click', function() { this.classList.toggle('open'); });
    });
}

searchInput.addEventListener('input', (e) => renderSymptoms(e.target.value));

// ===== ЗАМЕТКИ =====
function renderNotes() {
    if (notes.length === 0) {
        notesList.innerHTML = `<p style="color:#6b7a8f;text-align:center;">Нет заметок</p>`;
        return;
    }
    notesList.innerHTML = notes.map((note, i) => `
        <div class="note-item">
            <span>${note.title} <span class="note-date">${note.date || ''}</span></span>
            <button class="delete-note" data-index="${i}">✕</button>
        </div>
    `).join('');
    document.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', function() {
            notes.splice(parseInt(this.dataset.index), 1);
            localStorage.setItem('healthNotes', JSON.stringify(notes));
            renderNotes();
        });
    });
}

addNoteBtn.addEventListener('click', () => {
    const text = prompt('Новая заметка:');
    if (text) {
        notes.push({ title: text, date: new Date().toLocaleDateString() });
        localStorage.setItem('healthNotes', JSON.stringify(notes));
        renderNotes();
    }
});

// ===== ЛЕЧЕНИЕ =====
function updateTreatmentProgress() {
    const total = symptomsData.length;
    const done = completedSymptoms.length;
    treatmentProgress.textContent = `Вылечено: ${done} из ${total}`;
}

function loadTreatmentSelect() {
    const available = symptomsData.filter(s => !completedSymptoms.includes(s.title));
    treatmentSelect.innerHTML = '<option value="">— Выберите симптом —</option>';
    available.forEach((s, i) => {
        const opt = document.createElement('option');
        opt.value = symptomsData.indexOf(s);
        opt.textContent = s.icon + ' ' + s.title;
        treatmentSelect.appendChild(opt);
    });
    if (available.length === 0) {
        treatmentSelect.innerHTML = '<option value="">🎉 Все симптомы вылечены!</option>';
    }
    // Убираем старые обработчики, чтобы не дублировать
    const newSelect = treatmentSelect.cloneNode(true);
    treatmentSelect.parentNode.replaceChild(newSelect, treatmentSelect);
    newSelect.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value);
        if (isNaN(idx)) {
            treatmentSteps.innerHTML = '';
            completeBtn.style.display = 'none';
            return;
        }
        const s = symptomsData[idx];
        // ✅ Логируем симптом при выборе
        const today = new Date().toISOString().split('T')[0];
        symptomLog = symptomLog.filter(log => !(log.date === today && log.symptom === s.title));
        symptomLog.push({ symptom: s.title, date: today });
        localStorage.setItem('symptomLog', JSON.stringify(symptomLog));
        renderAnalytics();
        renderTreatment(idx);
    });
}

function renderTreatment(idx) {
    const s = symptomsData[idx];
    treatmentChecks = s.steps.map(() => false);
    treatmentSteps.innerHTML = s.steps.map((step, i) => `
        <div class="treatment-step">
            <input type="checkbox" data-i="${i}" />
            <label>${step}</label>
        </div>
    `).join('');
    completeBtn.style.display = 'block';

    document.querySelectorAll('.treatment-step input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function() {
            const i = parseInt(this.dataset.i);
            treatmentChecks[i] = this.checked;
            this.closest('.treatment-step').classList.toggle('done', this.checked);
        });
    });

    completeBtn.onclick = function() {
        if (treatmentChecks.every(v => v === true)) {
            if (!completedSymptoms.includes(s.title)) {
                completedSymptoms.push(s.title);
                localStorage.setItem('completedSymptoms', JSON.stringify(completedSymptoms));
                updateTreatmentProgress();
                renderSymptoms();
                loadTreatmentSelect();
                renderAnalytics();
                alert('✅ Лечение завершено!');
            }
            treatmentSteps.innerHTML = '';
            completeBtn.style.display = 'none';
            treatmentSelect.value = '';
        } else {
            alert('⚠️ Выполните все шаги!');
        }
    };
}

resetBtn.addEventListener('click', () => {
    if (confirm('Сбросить весь прогресс?')) {
        completedSymptoms = [];
        symptomLog = [];
        localStorage.setItem('completedSymptoms', JSON.stringify(completedSymptoms));
        localStorage.setItem('symptomLog', JSON.stringify(symptomLog));
        updateTreatmentProgress();
        renderSymptoms();
        loadTreatmentSelect();
        renderAnalytics();
        alert('Прогресс сброшен.');
    }
});

// ===== АНАЛИТИКА (ИСПРАВЛЕННАЯ) =====
function renderAnalytics() {
    const chart = document.getElementById('weekChart');
    const freqContainer = document.getElementById('frequentSymptoms');
    const recContainer = document.getElementById('recommendations');

    // ===== ПОСЛЕДНИЕ 7 ДНЕЙ ОТ СЕГОДНЯ =====
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d);
    }

    chart.innerHTML = days.map(d => {
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
        const count = symptomLog.filter(log => log.date === dateStr).length;
        
        let cls = 'day-block';
        if (count === 0) cls += ' good';
        else if (count <= 2) cls += ' ok';
        else cls += ' bad';
        return `<div class="${cls}">${dayName}<br>${count}</div>`;
    }).join('');

    // ===== ЧАСТЫЕ СИМПТОМЫ =====
    const freq = {};
    symptomLog.forEach(log => { freq[log.symptom] = (freq[log.symptom] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    freqContainer.innerHTML = sorted.length === 0
        ? '<p style="color:#6b7a8f;">Нет данных</p>'
        : sorted.slice(0, 5).map(([name, count]) =>
            `<div class="freq-item"><span>${name}</span><span>${count} раз</span></div>`
        ).join('');

    // ===== РЕКОМЕНДАЦИИ =====
    let recs = [];
    if (sorted.length > 0 && sorted[0][1] >= 3) {
        recs.push(`⚠️ Часто повторяется "${sorted[0][0]}". Обратитесь к врачу.`);
    }
    if (completedSymptoms.length === symptomsData.length) {
        recs.push('🎉 Все симптомы вылечены! Отлично!');
    } else if (completedSymptoms.length > 0) {
        recs.push(`✅ Вылечено ${completedSymptoms.length} из ${symptomsData.length}. Продолжайте!`);
    } else {
        recs.push('💡 Начните лечение первого симптома.');
    }
    recContainer.innerHTML = recs.map(r => `<div class="recommendation-item">${r}</div>`).join('');
}

// ===== ЖУРНАЛ =====
function renderMoodLog() {
    const container = document.getElementById('moodLog');
    if (!container) return;
    if (moodLog.length === 0) {
        container.innerHTML = '<p style="color:#6b7a8f;">Нет записей. Выберите настроение сегодня.</p>';
        return;
    }
    const sorted = [...moodLog].reverse();
    container.innerHTML = sorted.map(entry => {
        const moodText = entry.mood === 'good' ? '🟢 Хорошо' : entry.mood === 'ok' ? '🟡 Нормально' : '🔴 Плохо';
        return `<div class="mood-entry"><span class="date">${entry.date}</span><span class="mood-label">${moodText}</span></div>`;
    }).join('');
}

document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const mood = this.dataset.mood;
        const today = new Date().toISOString().split('T')[0];
        moodLog = moodLog.filter(entry => entry.date !== today);
        moodLog.push({ date: today, mood: mood });
        localStorage.setItem('moodLog', JSON.stringify(moodLog));
        renderMoodLog();
        renderAnalytics();
    });
});

// ===== ЭКСПОРТ =====
document.getElementById('exportDataBtn')?.addEventListener('click', function() {
    const symptoms = completedSymptoms.length > 0 ? completedSymptoms.join(', ') : 'нет';
    const moodStats = moodLog.map(e => `${e.date}: ${e.mood}`).join('\n');
    const notesText = notes.map(n => `${n.date}: ${n.title}`).join('\n');
    const text = `
📊 ДНЕВНИК ЗДОРОВЬЯ — ЭКСПОРТ
📅 Дата: ${new Date().toLocaleDateString()}
👤 Имя: ${currentUser}

✅ ВЫЛЕЧЕННЫЕ СИМПТОМЫ:
${symptoms}

📖 ЖУРНАЛ САМОЧУВСТВИЯ:
${moodStats || 'Нет записей'}

📝 ЗАМЕТКИ:
${notesText || 'Нет заметок'}
    `;
    alert(text);
});

// ===== ВРАЧ =====
document.getElementById('callDoctorBtn')?.addEventListener('click', function() {
    const phoneNumber = "112";
    const seriousSymptoms = symptomLog.filter(log => {
        const daysAgo = (Date.now() - new Date(log.date)) / (1000 * 60 * 60 * 24);
        return daysAgo < 7;
    }).length;
    let message = `📞 Врач: ${phoneNumber}\n`;
    if (seriousSymptoms > 3) {
        message += "⚠️ Симптомы повторяются часто. Позвоните срочно!";
    } else {
        message += "🩺 Запишитесь на приём по этому номеру.";
    }
    alert(message);
});

// ===== ВКЛАДКИ =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (tabId === 'tabAnalytics') renderAnalytics();
        if (tabId === 'tabTreatment') { updateTreatmentProgress(); loadTreatmentSelect(); }
        if (tabId === 'tabJournal') renderMoodLog();
    });
});

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', () => {
    splash.classList.remove('hidden');
    setTimeout(() => {
        splash.classList.add('hidden');
        if (localStorage.getItem('healthUser')) {
            currentUser = localStorage.getItem('healthUser');
            showApp();
        } else {
            showRegister();
        }
        applyTheme();
        updateTreatmentProgress();
        renderMoodLog();
    }, 2500);
});