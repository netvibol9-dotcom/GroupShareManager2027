/* =========================================================
   FACEBOOK LOGIN SDK
   ========================================================= */
const FB_APP_ID = '2149167585663122'; 

window.fbAsyncInit = function() {
    FB.init({
        appId      : FB_APP_ID,
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
    });

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/km_KH/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function statusChangeCallback(response) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginGateOverlay = document.getElementById('loginGateOverlay');

    if (response && response.status === 'connected') {
        // 1. បិទផ្ទាំង Login Overlay ពេល Login ជោគជ័យ
        if (loginGateOverlay) {
            loginGateOverlay.style.display = 'none';
        }

        FB.api('/me', {fields: 'name,picture'}, function(user) {
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <img src="${user.picture.data.url}" style="width:22px; height:22px; border-radius:50%; vertical-align:middle; margin-right:6px;">
                    ${user.name}
                `;
                loginBtn.onclick = null;
                loginBtn.style.cursor = 'default';
            }

            if (logoutBtn) {
                logoutBtn.style.display = 'inline-flex';
                logoutBtn.onclick = fbLogout;
            }
        });
    } else {
        // 2. បើកផ្ទាំង Login Overlay វិញពេលមិនទាន់ Login ឬ Logout
        if (loginGateOverlay) {
            loginGateOverlay.style.display = 'flex';
        }

        if (loginBtn) {
            loginBtn.innerHTML = `<span>🔵</span> ចូលគណនី (Login)`;
            loginBtn.onclick = fbLogin;
            loginBtn.style.cursor = 'pointer';
        }

        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
    }
}
        });
    } else {
        loginBtn.innerHTML = `<span>🔵</span> ចូលគណនី (Login)`;
        loginBtn.onclick = fbLogin;
        loginBtn.style.cursor = 'pointer';

        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
    }
}

function fbLogin() {
    if (typeof FB === 'undefined') {
        alert("កំពុងភ្ជាប់ទៅកាន់ Facebook... សូមរង់ចាំ ២ វិនាទី រួចចុចម្តងទៀត!");
        return;
    }
    FB.login(function(response) {
        statusChangeCallback(response);
    }, {scope: 'public_profile'});
}

function fbLogout() {
    if (typeof FB !== 'undefined') {
        FB.logout(function(response) {
            statusChangeCallback(response);
        });
    }
}

/* =========================================================
   DASHBOARD LOGIC & CONTROLLER
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
        caption: "TEST Caption Post",
        date: "8/19/2026, 9:33:34 PM",
        status: "Posted"
    }
];

let groups = JSON.parse(localStorage.getItem('gsm_groups')) || defaultGroups;
let histories = JSON.parse(localStorage.getItem('gsm_history')) || defaultHistory;

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
        box.style.marginBottom = '10px';
        box.innerHTML = `
            <div class="history-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">🔗 ${escapeHtml(item.url)}</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <button type="button" class="act-btn" onclick="openLink('${escapeHtml(item.url)}')" style="padding: 2px 8px; font-size: 11px;">Open</button>
                    <span class="badge-posted">● ${escapeHtml(item.status)}</span>
                </div>
            </div>
            <div class="history-desc" style="margin-top: 6px;">"${escapeHtml(item.caption)}"</div>
            <div class="history-date" style="margin-top: 4px;">📅 ${item.date}</div>
        `;
        historyList.appendChild(box);
    });
}

if (addGroupBtn) {
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
}

if (importGroupsBtn) {
    importGroupsBtn.addEventListener('click', () => {
        const input = prompt(
            "សូមបញ្ចូល Links របស់ Facebook Groups (ចុះបន្ទាត់មួយ Line = មួយ Group):\n\nឧទាហរណ៍:\nhttps://facebook.com/groups/group1\nhttps://facebook.com/groups/group2"
        );

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
        navigator.clipboard.writeText(caption).catch(err => {
            console.error("មិនអាច Copy បាន:", err);
        });
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
            navigator.clipboard.writeText(caption).catch(err => {
                console.error("មិនអាច Copy បាន:", err);
            });
        }

        selectedGroups.forEach(group => {
            const shareLink = postUrl 
                ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
                : group.url;

            window.open(shareLink, '_blank');
            addHistoryRecord(group.url, caption || "Post Update");
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

// ភ្ជាប់ Event ឱ្យប៊ូតុង Login ដំណើរការ
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.onclick = fbLogin;
    }
});

// Render ដំបូងពេលបើក Page
renderGroups();
renderHistory();
