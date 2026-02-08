// Data and State
let lessons = [];
let currentWeekStart = getStartOfWeek(new Date());
let activeTag = 'all';
let searchQuery = '';

// DOM Elements
const lessonForm = document.getElementById('lessonForm');
const lessonsContainer = document.getElementById('lessonsContainer');
const weekDisplay = document.getElementById('weekDisplay');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');
const searchBox = document.getElementById('searchBox');
const tagButtons = document.querySelectorAll('.tag-btn');

// Load data from localStorage on start
window.addEventListener('DOMContentLoaded', () => {
    loadLessons();
    updateWeekDisplay();
    renderLessons();
});

// Form Submit - Add Lesson
lessonForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newLesson = {
        id: Date.now(),
        date: document.getElementById('lessonDate').value,
        className: document.getElementById('lessonClass').value,
        topic: document.getElementById('lessonTopic').value,
        tag: document.getElementById('lessonTag').value,
        notes: document.getElementById('lessonNotes').value
    };
    
    lessons.push(newLesson);
    saveLessons();
    renderLessons();
    lessonForm.reset();
});

// Week Navigation
prevWeekBtn.addEventListener('click', () => {
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateWeekDisplay();
    renderLessons();
});

nextWeekBtn.addEventListener('click', () => {
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateWeekDisplay();
    renderLessons();
});

// Tag Filter
tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tagButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTag = btn.dataset.tag;
        renderLessons();
    });
});

// Search
searchBox.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderLessons();
});

// Helper Functions
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday as start
    return new Date(d.setDate(diff));
}

function updateWeekDisplay() {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const startStr = currentWeekStart.toLocaleDateString('en-US', options);
    const endStr = endOfWeek.toLocaleDateString('en-US', options);
    
    weekDisplay.textContent = `${startStr} - ${endStr}`;
}

function renderLessons() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    // Filter lessons
    let filteredLessons = lessons.filter(lesson => {
        const lessonDate = new Date(lesson.date);
        const inWeek = lessonDate >= currentWeekStart && lessonDate < weekEnd;
        const matchesTag = activeTag === 'all' || lesson.tag === activeTag;
        const matchesSearch = lesson.topic.toLowerCase().includes(searchQuery) || 
                             lesson.className.toLowerCase().includes(searchQuery);
        
        return inWeek && matchesTag && matchesSearch;
    });
    
    // Group by day
    const lessonsByDay = {};
    filteredLessons.forEach(lesson => {
        if (!lessonsByDay[lesson.date]) {
            lessonsByDay[lesson.date] = [];
        }
        lessonsByDay[lesson.date].push(lesson);
    });
    
    // Render
    lessonsContainer.innerHTML = '';
    
    if (Object.keys(lessonsByDay).length === 0) {
        lessonsContainer.innerHTML = '<div class="empty-state">No lessons found for this week.</div>';
        return;
    }
    
    // Sort dates
    const sortedDates = Object.keys(lessonsByDay).sort();
    
    sortedDates.forEach(date => {
        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        
        const dayTitle = document.createElement('h2');
        dayTitle.className = 'day-title';
        const dateObj = new Date(date + 'T00:00:00');
        dayTitle.textContent = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        daySection.appendChild(dayTitle);
        
        lessonsByDay[date].forEach(lesson => {
            const lessonCard = createLessonCard(lesson);
            daySection.appendChild(lessonCard);
        });
        
        lessonsContainer.appendChild(daySection);
    });
}

function createLessonCard(lesson) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    
    card.innerHTML = `
        <div class="lesson-header">
            <div class="lesson-info">
                <h3>${lesson.topic}</h3>
                <p>${lesson.className}</p>
            </div>
            <div>
                <span class="lesson-tag tag-${lesson.tag}">${lesson.tag}</span>
                <button class="delete-btn" onclick="deleteLesson(${lesson.id})">Delete</button>
            </div>
        </div>
        ${lesson.notes ? `<div class="lesson-notes">${lesson.notes}</div>` : ''}
    `;
    
    return card;
}

function deleteLesson(id) {
    lessons = lessons.filter(lesson => lesson.id !== id);
    saveLessons();
    renderLessons();
}

function saveLessons() {
    localStorage.setItem('lessons', JSON.stringify(lessons));
}

function loadLessons() {
    const saved = localStorage.getItem('lessons');
    if (saved) {
        lessons = JSON.parse(saved);
    }
}
