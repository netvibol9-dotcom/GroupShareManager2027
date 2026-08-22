/* =========================================================
   GROUPSHARE MANAGER 2027 - CONTROLLER & AUTH
   ========================================================= */

const defaultGroups = [
    { id: 1, name: "Facebook Group 1", url: "https://web.facebook.com/groups/116079099082791", selected: true },
    { id: 2, name: "Facebook Group 2", url: "", selected: false },
    { id: 3, name: "Facebook Group 3", url: "", selected: false }
];

const defaultHistory = [
    {
        id: 1,
        url: "https://web.facebook.com/groups/116079099082791",
        caption: "Welcome to GroupShare Manager!",
        date: new Date().toLocaleString(),
        status: "Posted"
    }
];

let groups = JSON.parse(localStorage.getItem('gsm_groups')) || defaultGroups;
let histories = JSON.parse(localStorage.getItem('gsm_history')) || defaultHistory;
let currentUser = JSON.parse(localStorage.getItem('gsm_user')) || null;

const loginGateOverlay = document.getElementById('loginGateOverlay');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const btnOverlayLogin = document.getElementById('btnOverlayLogin');

const groupsList = document.getElementById('groupsList');
const historyList = document.getElementById('historyList');
const totalGroupsEl = document.getElementById('totalGroups');
const successCountEl = document.getElementById('successCount');
const waitingCountEl = document.getElementById('waitingCount');
const captionInput = document.getElementById('caption');
const postUrlInput = document.getElementById('postUrl');
const addGroupBtn = document.getElementById('addGroupBtn');
const importGroupsBtn = document.getElementById('importGroupsBtn');
const selectAllBtn = document.getElementById('selectAllBtn');
const unselectAllBtn = document.getElementById('unselectAllBtn');
const sharePostBtn = document.getElementById('sharePostBtn');
const clearBtn = document.getElementById('clearBtn');

// មុខងារ Auth Login / Logout
function initAuth() {
    if (currentUser) {
        if (loginGateOverlay) loginGateOverlay.style.display = 'none';
        if (loginBtn) {
            loginBtn.innerHTML = `👤 ${currentUser.name}`;
            loginBtn.onclick = null;
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-flex';
            logoutBtn.onclick = logoutUser;
        }
    } else {
        if (loginGateOverlay) loginGateOverlay.style.display = 'flex';
        if (loginBtn) {
            loginBtn.innerHTML = `<span>🔵</span> ចូលគណនី (Login)`;
            loginBtn.onclick = loginUser;
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
    }
}

function loginUser() {
    const name = prompt("សូមបញ្ចូលឈ្មោះរបស់អ្នកដើម្បីចូលប្រើប្រាស់:", "Admin Member");
    if (!name || name.trim() === "") return;

    currentUser = { name: name.trim() };
    localStorage.setItem('gsm_user', JSON.stringify(currentUser));
    initAuth();
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('gsm_user');
    initAuth();
}

if (btnOverlayLogin) {
    btnOverlayLogin.onclick = loginUser;
}

// មុខងារទូទៅក្នុង Dashboard
function saveData() {
    localStorage.setItem('gsm_groups', JSON.stringify(groups));
    localStorage.setItem('gsm_history', JSON.stringify(histories));
}

function updateStats() {
    if (totalGroupsEl) totalGroupsEl.innerText = groups.length;
    if (successCountEl) successCountEl.innerText = histories.filter(h => h.status === 'Posted').length;
    const selectedCount = groups.filter(g => g.selected && g.url).length;
    if (waitingCountEl) waitingCountEl.innerText = selectedCount;
}

function renderGroups() {
    if (!groupsList) return;
    groupsList.innerHTML = '';

    if (groups.length === 0) {
        groupsList.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">មិនទាន់មាន Group នៅឡើយទេ</div>';
        updateStats();
        return;
    }

    groups.forEach((group) => {
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
                <button type="button" class="act-btn" onclick="openLink('${escapeHtml(group.url)}')" ${!hasUrl ? 'disabled' : ''}>Open</button>
                <button type="button" class="act-btn share" onclick="shareSingle(${group.id})" ${!hasUrl ? 'disabled' : ''}>Share</button>
                <button type="button" class="act-btn" onclick="editGroup(${group.id})">Edit</button>
                <button type="button" class="act-btn delete" onclick="deleteGroup(${group.id})">Delete</button>
            </div>
        `;
        groupsList.appendChild(row);
    });

    updateStats();
}

function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (histories.length === 0) {
        historyList.innerHTML = '<div style="text-align:center; padding:15px; color:#64748b;">គ្មានប្រវត្តិ Share ទេ</div>';
        return;
    }

    histories.slice().reverse().forEach(item => {
        const box = document.createElement('div');
        box.className = 'history-box';
        box.innerHTML = `
            <div class="history-header">
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;">🔗 ${escapeHtml(item.url)}</span>
                <span class="badge-posted">● ${escapeHtml(item.status)}</span>
            </div>
            <div class="history-desc">"${escapeHtml(item.caption)}"</div>
            <div class="history-date">📅 ${item.date}</div>
        `;
        historyList.appendChild(box);
    });
}

if (addGroupBtn) {
    addGroupBtn.addEventListener('click', () => {
        const name = prompt("បញ្ចូលឈ្មោះ Group របស់អ្នក:");
        if (!name || name.trim() === '') return;

        const url = prompt("បញ្ចូល Link របស់ Facebook Group (URL):");
        groups.push({
            id: Date.now(),
            name: name.trim(),
            url: url ? url.trim() : '',
            selected: true
        });
        saveData();
        renderGroups();
    });
}

if (importGroupsBtn) {
    importGroupsBtn.addEventListener('click', () => {
        const input = prompt("សូមបញ្ចូល Links របស់ Facebook Groups (មួយបន្ទាត់ = មួយ Group):");
        if (!input || input.trim() === '') return;

        const lines = input.split('\n');
        let count = 0;

        lines.forEach((line) => {
            const url = line.trim();
            if (url) {
                count++;
                groups.push({
                    id: Date.now() + Math.random(),
                    name: `Facebook Group ${groups.length + 1}`,
                    url: url,
                    selected: true
                });
            }
        });

        if (count > 0) {
            saveData();
            renderGroups();
            alert(`បានបន្ថែម ${count} Groups ជោគជ័យ!`);
        }
    });
}

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

window.deleteGroup = function(id) {
    if (confirm("តើអ្នកពិតជាចង់លុប Group នេះមែនទេ?")) {
        groups = groups.filter(g => g.id !== id);
        saveData();
        renderGroups();
    }
};

window.toggleSelect = function(id) {
    const group = groups.find(g => g.id === id);
    if (group) {
        group.selected = !group.selected;
        saveData();
        updateStats();
    }
};

if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
        groups.forEach(g => g.selected = true);
        saveData();
        renderGroups();
    });
}

if (unselectAllBtn) {
    unselectAllBtn.addEventListener('click', () => {
        groups.forEach(g => g.selected = false);
        saveData();
        renderGroups();
    });
}

window.openLink = function(url) {
    if (url) window.open(url, '_blank');
};

window.shareSingle = function(id) {
    const group = groups.find(g => g.id === id);
    const caption = captionInput ? captionInput.value.trim() : "";
    const postUrl = postUrlInput ? postUrlInput.value.trim() : "";

    if (!group || !group.url) {
        alert("Group នេះមិនទាន់មាន Link ទេ!");
        return;
    }

    if (caption && navigator.clipboard) {
        navigator.clipboard.writeText(caption).catch(err => console.error(err));
    }

    const shareLink = postUrl 
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
        : group.url;
    
    window.open(shareLink, '_blank');
    addHistoryRecord(group.url, caption || "Post Update");
};

if (sharePostBtn) {
    sharePostBtn.addEventListener('click', () => {
        const selectedGroups = groups.filter(g => g.selected && g.url);
        const caption = captionInput ? captionInput.value.trim() : "";
        const postUrl = postUrlInput ? postUrlInput.value.trim() : "";

        if (selectedGroups.length === 0) {
            alert("សូមជ្រើសរើស Group យ៉ាងហោចណាស់មួយដែលមាន Link URL!");
            return;
        }

        if (caption && navigator.clipboard) {
            navigator.clipboard.writeText(caption).catch(err => console.error(err));
        }

        alert(`កំពុងបើក ${selectedGroups.length} Groups។ ប្រព័ន្ធបាន Copy Caption រួចរាល់ សូម Paste (Ctrl + V) រួចចុច Post!`);

        selectedGroups.forEach((group, index) => {
            setTimeout(() => {
                const shareLink = postUrl 
                    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
                    : group.url;

                window.open(shareLink, '_blank');
                addHistoryRecord(group.url, caption || "Post Update");
            }, index * 1200);
        });
    });
}

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

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (captionInput) captionInput.value = '';
        if (postUrlInput) postUrlInput.value = '';
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text || '';
    return div.innerHTML;
}

// ចាប់ផ្តើមដំណើរការ
initAuth();
renderGroups();
renderHistory();
