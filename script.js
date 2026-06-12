const TRACK_DATA = [
    { id: 'dev', name: 'Software Development', icon: 'fa-code' },
    { id: 'auto', name: 'AI Automation', icon: 'fa-robot' },
    { id: 'found', name: 'AI Foundations', icon: 'fa-brain' },
    { id: 'content', name: 'AI Content Creation', icon: 'fa-pen-nib' }
];

// Initial State
let state = JSON.parse(localStorage.getItem('tomatrix_state')) || {
    selectedTrack: null,
    unlockedLessons: ['m1-l1'],
    completedLessons: [],
    completedModules: [],
    currentLesson: 'm1-l1'
};

function init() {
    renderTracks();
    if (state.selectedTrack) {
        showDashboard();
    }
}

function renderTracks() {
    const grid = document.getElementById('track-grid');
    grid.innerHTML = TRACK_DATA.map(t => `
        <div class="track-card" onclick="selectTrack('${t.id}')">
            <i class="fas ${t.icon}"></i>
            <h3>${t.name}</h3>
            <p>3 Modules • 15 Micro-Lessons</p>
        </div>
    `).join('');
}

function selectTrack(id) {
    state.selectedTrack = id;
    save();
    showDashboard();
}

function showDashboard() {
    document.getElementById('selection-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    document.getElementById('active-track-name').innerText = TRACK_DATA.find(t => t.id === state.selectedTrack).name;
    renderSidebar();
    renderLesson();
    updateProgress();
}

function renderSidebar() {
    const nav = document.getElementById('automation-nav');
    let html = '';
    for (let m = 1; m <= 3; m++) {
        html += `<div class="mod-group"><div class="mod-title">Module ${m}</div>`;
        for (let l = 1; l <= 5; l++) {
            const id = `m${m}-l${l}`;
            const isUnlocked = state.unlockedLessons.includes(id);
            const isDone = state.completedLessons.includes(id);
            const isActive = state.currentLesson === id;
            
            html += `
                <div class="lesson-item ${isUnlocked ? 'unlocked' : 'locked'} ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}" 
                     onclick="jumpToLesson('${id}')">
                    <i class="fas ${isDone ? 'fa-check-circle' : (isUnlocked ? 'fa-play-circle' : 'fa-lock')}"></i>
                    Lesson ${l}
                </div>`;
        }
        html += `</div>`;
    }
    nav.innerHTML = html;
}

function renderLesson() {
    const [m, l] = state.currentLesson.split('-').map(v => v.substring(1));
    const isDone = state.completedLessons.includes(state.currentLesson);
    
    document.getElementById('lesson-card').innerHTML = `
        <span class="day-badge">Module ${m} • Lesson ${l}</span>
        <h2 style="margin: 1.5rem 0; font-size: 2.5rem;">Core Intelligence Training</h2>
        <p style="color: var(--text-dim); margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.8;">
            This micro-lesson is part of the automated ${TRACK_DATA.find(t => t.id === state.selectedTrack).name} roadmap. 
            The Tomatrix engine has verified your progress and unlocked this specific knowledge node.
        </p>
        ${isDone ? '<button class="btn-primary" disabled>Completed</button>' : 
           (l == 5 ? `<button class="btn-primary" onclick="triggerQuiz(${m})">Unlock Module Quiz</button>` : 
           `<button class="btn-primary" onclick="completeLesson()">Mark Lesson Complete</button>`)}
    `;
}

function completeLesson() {
    if (!state.completedLessons.includes(state.currentLesson)) {
        state.completedLessons.push(state.currentLesson);
        const [m, l] = state.currentLesson.split('-').map(v => parseInt(v.substring(1)));
        const nextId = `m${m}-l${l + 1}`;
        if (!state.unlockedLessons.includes(nextId)) state.unlockedLessons.push(nextId);
        state.currentLesson = nextId;
        save();
        showDashboard();
    }
}

function triggerQuiz(m) {
    const modal = document.getElementById('quiz-modal');
    modal.style.display = 'flex';
    document.getElementById('quiz-container').innerHTML = `
        <h2>Module ${m} Validation</h2>
        <p style="margin-bottom: 2rem;">Prove your mastery to unlock the next module.</p>
        <div style="margin-bottom: 1.5rem;">
            <p>1. Is automation the core of this system?</p>
            <button class="btn-primary" onclick="checkQuiz(true, ${m})">Yes</button>
            <button class="btn-primary" onclick="checkQuiz(false, ${m})">No</button>
        </div>
    `;
}

function checkQuiz(passed, m) {
    if (passed) {
        state.completedLessons.push(`m${m}-l5`); // Finalize lesson 5
        state.completedModules.push(`m${m}`);
        if (m < 3) {
            const nextModFirstLesson = `m${m+1}-l1`;
            state.unlockedLessons.push(nextModFirstLesson);
            state.currentLesson = nextModFirstLesson;
            document.getElementById('quiz-modal').style.display = 'none';
            save();
            showDashboard();
        } else {
            showCert();
        }
    } else {
        alert("Automation error: mastery not detected. Retry quiz.");
    }
}

function updateProgress() {
    const percent = Math.round((state.completedLessons.length / 15) * 100);
    document.getElementById('main-progress-fill').style.width = percent + '%';
    if (state.completedLessons.length > 5) document.getElementById('logic-step-2').className = 'done';
    if (state.completedModules.length > 0) document.getElementById('logic-step-3').className = 'done';
}

function showCert() {
    document.getElementById('quiz-modal').style.display = 'none';
    document.getElementById('cert-modal').style.display = 'flex';
    document.getElementById('cert-track').innerText = TRACK_DATA.find(t => t.id === state.selectedTrack).name;
    document.getElementById('cert-date').innerText = new Date().toLocaleDateString();
}

function jumpToLesson(id) {
    if (state.unlockedLessons.includes(id)) {
        state.currentLesson = id;
        save();
        showDashboard();
    }
}

function save() { localStorage.setItem('tomatrix_state', JSON.stringify(state)); }
function resetEngine() { localStorage.removeItem('tomatrix_state'); location.reload(); }

init();