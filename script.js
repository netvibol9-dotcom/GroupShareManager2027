/* =========================================================
   GroupShare Manager 2027 - Logic Controller (script.js)
   ========================================================= */

// ១. ទិន្នន័យគំរូដើម (Initial Default Data)
const initialGroups = [
    { id: 1, name: "Facebook Group 1", url: "https://web.facebook.com/groups/116079099082791", selected: true },
    { id: 2, name: "Facebook Group 2", url: "", selected: false },
    { id: 3, name: "Facebook Group 3", url: "", selected: false }
];

const initialHistory = [
    {
        id: 1,
        url: "https://web.facebook.com/groups/116079099082791",
        caption: "TEST Caption Post",
        date: "8/19/2026, 9:33:34 PM",
        status: "Posted"
    }
];

// ទាញទិន្នន័យពី LocalStorage ឬប្រើទិន្នន័យដើម
let groups = JSON.parse(localStorage.getItem('gsm_groups')) || initialGroups;
let histories = JSON.parse(localStorage.getItem('gsm_history')) || initialHistory;

// ២. ចាប់យក Element ពី HTML
const groupsList = document.getElementById('groupsList');
const historyList = document.getElementById('historyList');
const totalGroupsEl = document.getElementById('totalGroups');
const successCountEl = document.getElementById('successCount');
const waitingCountEl = document.getElementById('waitingCount');
const captionInput = document.getElementById('caption');
const postUrlInput = document.getElementById('postUrl');
const addGroupBtn = document.getElementById('addGroupBtn');
const selectAllBtn = document.getElementById('selectAllBtn');
const unselectAllBtn = document.getElementById('unselectAllBtn');
const sharePostBtn = document.getElementById('sharePostBtn');
const clearBtn = document.getElementById('clearBtn');

// ៣. រក្សាទុកទិន្នន័យទៅ LocalStorage
function saveData() {
    localStorage.setItem('gsm_groups', JSON.stringify(groups));
    localStorage.setItem('gsm_history', JSON.stringify(histories));
}

// ៤. ធ្វើបច្ចុប្បន្នភាពស្ថិតិ (Update Stats)
function updateStats() {
    totalGroupsEl.innerText = groups.length;
    successCountEl.innerText = histories.filter(h => h.status === 'Posted').length;
    const selectedCount = groups.filter(g => g.selected && g.url).length;
    waitingCountEl.innerText = selectedCount;
}

// ៥. បង្ហាញបញ្ជី Groups (Render Groups)
function renderGroups() {
    groupsList.innerHTML = '';

    if (groups.length === 0) {
        groupsList.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">មិនទាន់មាន Group នៅឡើយទេ</div>';
        updateStats();
        return;
    }

    groups.forEach((group, index) => {
        const row = document.createElement('div');
        row.className = 'group-row';

        const hasUrl = group.url && group.url.trim() !== '';
        const urlDisplay = hasUrl 
            ? `<span>${escapeHtml(group.url)}</span>`
            : `<span class="no-link">⚠️ មិនទាន់មាន URL</span>`;

        row.innerHTML = `
            <div class="group-left">
                <input type="checkbox" id="chk-${group.id}" ${group.selected ? 'checked' : ''} onchange="toggleSelect(${group.id})">
                <div class="group-text">
                    <strong>${escapeHtml(group.name)}</strong>
                    ${urlDisplay}
                </div>
            </div>
            <div class="group-right-actions">
                <button class="act-btn" onclick="openLink('${group.url}')" ${!hasUrl ? 'disabled' : ''}>Open</button>
                <button class="act-btn share" onclick="shareSingle(${group.id})" ${!hasUrl ? 'disabled' : ''}>Share</button>
                <button class="act-btn" onclick="editGroup(${group.id})">Edit</button>
                <button class="act-btn delete" onclick="deleteGroup(${group.id})">Delete</button>
            </div>
        `;
        groupsList.appendChild(row);
    });

    updateStats();
}

// ៦. បង្ហាញប្រវត្តិ (Render History)
function renderHistory() {
    historyList.innerHTML = '';

    if (histories.length === 0) {
        historyList.innerHTML = '<div style="text-align:center; padding:15px; color:#64748b;">គ្មានប្រវត្តិ Share ទេ</div>';
        return;
    }

    histories.slice().reverse().forEach(item => {
        const box = document.createElement('div');
        box.className = 'history-box';
        box.style.marginBottom = '10px';
        box.innerHTML = `
            <div class="history-header">
                <span>🔗 ${escapeHtml(item.url)}</span>
                <span class="badge-posted">● ${escapeHtml(item.status)}</span>
            </div>
            <div class="history-desc">"${escapeHtml(item.caption)}"</div>
            <div class="history-date">📅 ${item.date}</div>
        `;
        historyList.appendChild(box);
    });
}

// ៧. មុខងារបន្ថែម Group ថ្មី (Add Group)
addGroupBtn.addEventListener('click', () => {
    const name = prompt("បញ្ចូលឈ្មោះ Group របស់អ្នក:");
    if (!name || name.trim() === '') return;

    const url = prompt("បញ្ចូល Link របស់ Facebook Group (URL):");
    const newGroup = {
        id: Date.now(),
        name: name.trim(),
        url: url ? url.trim() : '',
        selected: true
    };

    groups.push(newGroup);
    saveData();
    renderGroups();
});

// ៨. មុខងារកែប្រែ Group (Edit)
window.editGroup = function(id) {
    const group = groups.find(g => g.id === id);
    if (!group) return;

    const newName = prompt("កែប្រែឈ្មោះ Group:", group.name);
    if (newName === null) return;

    const newUrl = prompt("កែប្រែ Link Group:", group.url);
    if (newUrl === null) return;

    group.name = newName.trim() || group.name;
    group.url = newUrl.trim();
    saveData();
    renderGroups();
};

// ៩. មុខងារលុប Group (Delete)
window.deleteGroup = function(id) {
    if (confirm("តើអ្នកពិតជាចង់លុប Group នេះមែនទេ?")) {
        groups = groups.filter(g => g.id !== id);
        saveData();
        renderGroups();
    }
};

// ១០. មុខងារធីកជ្រើសរើស (Checkbox)
window.toggleSelect = function(id) {
    const group = groups.find(g => g.id === id);
    if (group) {
        group.selected = !group.selected;
        saveData();
        updateStats();
    }
};

// ១១. មុខងារ Select All / Unselect All
selectAllBtn.addEventListener('click', () => {
    groups.forEach(g => g.selected = true);
    saveData();
    renderGroups();
});

unselectAllBtn.addEventListener('click', () => {
    groups.forEach(g => g.selected = false);
    saveData();
    renderGroups();
});

// ១២. បើក Link Group
window.openLink = function(url) {
    if (url) window.open(url, '_blank');
};

// ១៣. មុខងារ Share ទៅកាន់ Group តែមួយ
window.shareSingle = function(id) {
    const group = groups.find(g => g.id === id);
    const caption = captionInput.value.trim() || "Post Update";
    const postUrl = postUrlInput.value.trim();

    if (!group || !group.url) {
        alert("Group នេះមិនទាន់មាន Link ទេ!");
        return;
    }

    // បើកផ្ទាំង Facebook Share Dialog ឬ Group URL
    const shareLink = postUrl 
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
        : group.url;
    
    window.open(shareLink, '_blank');

    // កត់ត្រាចូល History
    addHistoryRecord(group.url, caption);
};

// ១៤. មុខងារ Share ទៅ Groups ទាំងអស់ដែលបានជ្រើស
sharePostBtn.addEventListener('click', () => {
    const selectedGroups = groups.filter(g => g.selected && g.url);
    const caption = captionInput.value.trim() || "Post Update";
    const postUrl = postUrlInput.value.trim();

    if (selectedGroups.length === 0) {
        alert("សូមជ្រើសរើស Group យ៉ាងហោចណាស់មួយដែលមាន Link URL!");
        return;
    }

    selectedGroups.forEach(group => {
        const shareLink = postUrl 
            ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
            : group.url;

        window.open(shareLink, '_blank');
        addHistoryRecord(group.url, caption);
    });
});

function addHistoryRecord(url, caption) {
    histories.push({
        id: Date.now() + Math.random(),
        url: url,
        caption: caption,
        date: new Date().toLocaleString(),
        status: "Posted"
    });
    saveData();
    renderHistory();
    updateStats();
}

// ១៥. សម្អាត Input (Clear)
clearBtn.addEventListener('click', () => {
    captionInput.value = '';
    postUrlInput.value = '';
});

// ការពារ XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text || '';
    return div.innerHTML;
}

// ចាប់ផ្ដើមដំណើរការដំបូងពេលបើក Page
renderGroups();
renderHistory();
