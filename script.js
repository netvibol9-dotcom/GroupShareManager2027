// ======================================================
// GroupShare Manager2027
// SCRIPT.JS - Stable Version
// Groups + Share Assistant + Share History + Open URL
// ======================================================


// ======================================================
// STORAGE KEYS
// DO NOT CHANGE - preserves existing data
// ======================================================

const GROUPS_KEY = "gsm2027_groups";
const HISTORY_KEY = "gsm2027_history";


// ======================================================
// LOAD DATA
// ======================================================

function loadJSON(key, fallback) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        const parsed = JSON.parse(data);

        return parsed;
    } catch (error) {
        console.error("Storage load error:", error);
        return fallback;
    }
}


let groups = loadJSON(GROUPS_KEY, [
    {
        id: Date.now() + 1,
        name: "Group 1",
        url: ""
    },
    {
        id: Date.now() + 2,
        name: "Group 2",
        url: ""
    },
    {
        id: Date.now() + 3,
        name: "Group 3",
        url: ""
    }
]);


let history = loadJSON(HISTORY_KEY, []);


// ======================================================
// SAVE DATA
// ======================================================

function saveGroups() {

    localStorage.setItem(
        GROUPS_KEY,
        JSON.stringify(groups)
    );
}


function saveHistory() {

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// ADD GROUP
// ======================================================

function addGroup() {

    const name = prompt(
        "បញ្ចូលឈ្មោះ Group:"
    );

    if (!name || !name.trim()) {
        return;
    }

    const url = prompt(
        "បញ្ចូល Group URL:"
    );

    groups.push({
        id: Date.now(),
        name: name.trim(),
        url: url ? url.trim() : ""
    });

    saveGroups();

    renderGroups();
    updateDashboard();

    alert(
        "✅ បានបន្ថែម Group រួចរាល់!"
    );
}


// ======================================================
// EDIT GROUP
// ======================================================

function editGroup(id) {

    const group = groups.find(
        g => g.id === id
    );

    if (!group) {
        return;
    }

    const name = prompt(
        "កែឈ្មោះ Group:",
        group.name
    );

    if (name === null) {
        return;
    }

    const url = prompt(
        "កែ Group URL:",
        group.url || ""
    );

    if (url === null) {
        return;
    }

    group.name = name.trim();

    group.url = url.trim();

    saveGroups();

    renderGroups();
    updateDashboard();
}


// ======================================================
// DELETE GROUP
// ======================================================

function deleteGroup(id) {

    const group = groups.find(
        g => g.id === id
    );

    if (!group) {
        return;
    }

    const confirmed = confirm(
        `តើអ្នកចង់លុប "${group.name}" មែនទេ?`
    );

    if (!confirmed) {
        return;
    }

    groups = groups.filter(
        g => g.id !== id
    );

    saveGroups();

    renderGroups();
    updateDashboard();
}


// ======================================================
// OPEN GROUP
// ======================================================

function openGroup(id) {

    const group = groups.find(
        g => g.id === id
    );

    if (!group) {
        return;
    }

    if (!group.url) {

        alert(
            "⚠️ Group នេះមិនទាន់មាន URL ទេ។"
        );

        return;
    }

    window.open(
        group.url,
        "_blank",
        "noopener,noreferrer"
    );
}


// ======================================================
// SELECT ALL GROUPS
// ======================================================

function selectAllGroups() {

    const checkboxes =
        document.querySelectorAll(
            ".group-checkbox"
        );

    checkboxes.forEach(
        checkbox => {
            checkbox.checked = true;
        }
    );
}


// ======================================================
// UNSELECT ALL GROUPS
// ======================================================

function unselectAllGroups() {

    const checkboxes =
        document.querySelectorAll(
            ".group-checkbox"
        );

    checkboxes.forEach(
        checkbox => {
            checkbox.checked = false;
        }
    );
}


// ======================================================
// GET SELECTED GROUPS
// ======================================================

function getSelectedGroups() {

    const checkboxes =
        document.querySelectorAll(
            ".group-checkbox:checked"
        );

    return Array.from(checkboxes)
        .map(checkbox => {

            return groups.find(
                g => String(g.id) ===
                     String(checkbox.value)
            );

        })
        .filter(Boolean);
}


// ======================================================
// COPY TEXT
// ======================================================

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        return true;

    } catch (error) {

        console.warn(
            "Clipboard API unavailable:",
            error
        );

        try {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value = text;

            textarea.style.position =
                "fixed";

            textarea.style.opacity = "0";

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();

            return true;

        } catch (fallbackError) {

            console.error(
                "Copy failed:",
                fallbackError
            );

            return false;
        }
    }
}


// ======================================================
// CREATE HISTORY ITEM
// ======================================================

function createHistoryItem(
    group,
    caption,
    postUrl
) {

    return {

        id: Date.now() +
            Math.floor(
                Math.random() * 100000
            ),

        groupId: group.id,

        groupName: group.name,

        caption: caption,

        url: postUrl,

        groupUrl: group.url,

        status: "Waiting",

        date:
            new Date().toLocaleString()
    };
}


// ======================================================
// SHARE POST TO ONE GROUP
// ======================================================

async function sharePostToGroup(id) {

    const group = groups.find(
        g => g.id === id
    );

    if (!group) {
        return;
    }

    const captionElement =
        document.getElementById(
            "caption"
        );

    const postUrlElement =
        document.getElementById(
            "postUrl"
        );

    const caption =
        captionElement
        ? captionElement.value.trim()
        : "";

    const postUrl =
        postUrlElement
        ? postUrlElement.value.trim()
        : "";


    if (!caption && !postUrl) {

        alert(
            "⚠️ សូមបញ្ចូល Caption ឬ Post URL ជាមុនសិន។"
        );

        return;
    }


    if (!group.url) {

        alert(
            "⚠️ Group នេះមិនទាន់មាន URL ទេ។"
        );

        return;
    }


    let shareText = caption;

    if (postUrl) {

        if (shareText) {
            shareText += "\n\n";
        }

        shareText += postUrl;
    }


    // Copy caption + post URL
    const copied =
        await copyText(shareText);


    // Save history
    const item =
        createHistoryItem(
            group,
            caption,
            postUrl
        );

    history.push(item);

    saveHistory();

    renderHistory();

    updateDashboard();


    // Open Facebook Group
    window.open(
        group.url,
        "_blank",
        "noopener,noreferrer"
    );


    if (copied) {

        alert(
            `📋 Content បាន Copy រួច!\n\n` +
            `${group.name}\n\n` +
            `ចូល Group ហើយ Paste (Ctrl + V) ` +
            `ដើម្បីបង្ហោះ។`
        );

    } else {

        alert(
            `⚠️ មិនអាច Copy ដោយស្វ័យប្រវត្តិបានទេ។\n\n` +
            `ចូល ${group.name} ហើយ Copy/Paste ដោយខ្លួនឯង។`
        );
    }
}


// ======================================================
// SHARE SELECTED GROUPS
// ======================================================

async function shareSelectedGroups() {

    const selected =
        getSelectedGroups();

    if (selected.length === 0) {

        alert(
            "⚠️ សូមជ្រើសរើសយ៉ាងហោចណាស់ 1 Group។"
        );

        return;
    }


    const captionElement =
        document.getElementById(
            "caption"
        );

    const postUrlElement =
        document.getElementById(
            "postUrl"
        );


    const caption =
        captionElement
        ? captionElement.value.trim()
        : "";


    const postUrl =
        postUrlElement
        ? postUrlElement.value.trim()
        : "";


    if (!caption && !postUrl) {

        alert(
            "⚠️ សូមបញ្ចូល Caption ឬ Post URL ជាមុនសិន។"
        );

        return;
    }


    let shareText = caption;

    if (postUrl) {

        if (shareText) {
            shareText += "\n\n";
        }

        shareText += postUrl;
    }


    await copyText(shareText);


    let opened = 0;


    selected.forEach(
        group => {

            if (!group.url) {
                return;
            }


            const item =
                createHistoryItem(
                    group,
                    caption,
                    postUrl
                );

            history.push(item);

            opened++;

        }
    );


    saveHistory();

    renderHistory();

    updateDashboard();


    alert(
        `📋 Content បាន Copy រួច!\n\n` +
        `បានជ្រើសរើស ${selected.length} Groups\n` +
        `មាន URL ${opened} Groups\n\n` +
        `បច្ចុប្បន្ននេះ សូមបើក Group ហើយ Paste ដោយខ្លួនឯង។`
    );
}


// ======================================================
// CLEAR POST FORM
// ======================================================

function clearPost() {

    const caption =
        document.getElementById(
            "caption"
        );

    const postUrl =
        document.getElementById(
            "postUrl"
        );


    if (caption) {
        caption.value = "";
    }


    if (postUrl) {
        postUrl.value = "";
    }


    unselectAllGroups();
}


// ======================================================
// MARK AS POSTED
// ======================================================

function markAsPosted(historyId) {

    const item =
        history.find(
            h => h.id === historyId
        );

    if (!item) {
        return;
    }


    item.status = "Posted";

    saveHistory();

    renderHistory();

    updateDashboard();
}


// ======================================================
// MARK AS WAITING
// ======================================================

function markAsWaiting(historyId) {

    const item =
        history.find(
            h => h.id === historyId
        );

    if (!item) {
        return;
    }


    item.status = "Waiting";

    saveHistory();

    renderHistory();

    updateDashboard();
}


// ======================================================
// OPEN POST URL FROM HISTORY
// ⭐ NEW FEATURE
// ======================================================

function openHistoryUrl(historyId) {

    const item =
        history.find(
            h => h.id === historyId
        );

    if (!item) {

        alert(
            "⚠️ មិនអាចរក History នេះបានទេ។"
        );

        return;
    }


    if (!item.url) {

        alert(
            "⚠️ History នេះមិនមាន Post URL ទេ។"
        );

        return;
    }


    window.open(
        item.url,
        "_blank",
        "noopener,noreferrer"
    );
}


// ======================================================
// OPEN GROUP FROM HISTORY
// ======================================================

function openHistoryGroup(historyId) {

    const item =
        history.find(
            h => h.id === historyId
        );

    if (!item) {
        return;
    }


    if (!item.groupUrl) {

        const group =
            groups.find(
                g => g.id === item.groupId
            );

        if (group && group.url) {

            window.open(
                group.url,
                "_blank",
                "noopener,noreferrer"
            );

            return;
        }


        alert(
            "⚠️ មិនមាន Group URL ទេ។"
        );

        return;
    }


    window.open(
        item.groupUrl,
        "_blank",
        "noopener,noreferrer"
    );
}


// ======================================================
// DELETE HISTORY
// ======================================================

function deleteHistory(historyId) {

    const confirmed =
        confirm(
            "តើអ្នកចង់លុប History នេះមែនទេ?"
        );

    if (!confirmed) {
        return;
    }


    history =
        history.filter(
            h => h.id !== historyId
        );


    saveHistory();

    renderHistory();

    updateDashboard();
}


// ======================================================
// CLEAR ALL HISTORY
// ======================================================

function clearAllHistory() {

    if (history.length === 0) {

        alert(
            "ℹ️ មិនទាន់មាន History ទេ។"
        );

        return;
    }


    const confirmed =
        confirm(
            "⚠️ តើអ្នកចង់លុប Share History ទាំងអស់មែនទេ?"
        );


    if (!confirmed) {
        return;
    }


    history = [];

    saveHistory();

    renderHistory();

    updateDashboard();
}


// ======================================================
// RENDER GROUPS
// ======================================================

function renderGroups() {

    const container =
        document.getElementById(
            "groups"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    groups.forEach(
        (group, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "group-card";


            card.innerHTML = `

                <div class="group-info">

                    <input
                        type="checkbox"
                        class="group-checkbox"
                        value="${group.id}"
                    >

                    <div class="group-details">

                        <strong>
                            ${index + 1}.
                            ${escapeHTML(group.name)}
                        </strong>

                        <small>
                            ${
                                group.url
                                ? escapeHTML(group.url)
                                : "⚠️ មិនទាន់មាន URL"
                            }
                        </small>

                    </div>

                </div>


                <div class="group-actions">

                    <button
                        type="button"
                        onclick="openGroup(${group.id})"
                        ${group.url ? "" : "disabled"}
                    >
                        🔗 Open
                    </button>


                    <button
                        type="button"
                        onclick="sharePostToGroup(${group.id})"
                        ${group.url ? "" : "disabled"}
                    >
                        📤 Share Post
                    </button>


                    <button
                        type="button"
                        onclick="editGroup(${group.id})"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        type="button"
                        onclick="deleteGroup(${group.id})"
                        class="delete-btn"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );
        }
    );


    if (groups.length === 0) {

        container.innerHTML = `

            <div class="empty-history">

                📭 មិនទាន់មាន Facebook Group ទេ។

                <br><br>

                ចុច
                <strong>+ Add Group</strong>
                ដើម្បីបន្ថែម Group។

            </div>

        `;
    }
}


// ======================================================
// RENDER SHARE HISTORY
// ======================================================

function renderHistory() {

    const container =
        document.getElementById(
            "history"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (history.length === 0) {

        container.innerHTML = `

            <div class="empty-history">

                🕒 មិនទាន់មាន Share History ទេ។

            </div>

        `;

        return;
    }


    [...history]
        .reverse()
        .forEach(
            item => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "history-item";


                const statusClass =
                    item.status === "Posted"
                    ? "status-posted"
                    : "status-waiting";


                const statusText =
                    item.status === "Posted"
                    ? "🟢 Posted"
                    : "🟡 Waiting";


                row.innerHTML = `

                    <div class="history-main">

                        <strong>
                            ${escapeHTML(
                                item.groupName
                            )}
                        </strong>


                        <small>
                            ${escapeHTML(
                                item.date
                            )}
                        </small>


                        <p>
                            ${
                                escapeHTML(
                                    item.caption ||
                                    "No caption"
                                )
                            }
                        </p>


                        ${
                            item.url
                            ?
                            `
                            <div class="history-url">
                                🔗
                                <span>
                                    ${escapeHTML(item.url)}
                                </span>
                            </div>
                            `
                            :
                            `
                            <div class="history-url">
                                ⚠️ No Post URL
                            </div>
                            `
                        }

                    </div>


                    <div class="history-actions">

                        <span
                            class="${statusClass}"
                        >
                            ${statusText}
                        </span>


                        ${
                            item.url
                            ?
                            `
                            <button
                                type="button"
                                onclick="openHistoryUrl(${item.id})"
                            >
                                🔗 Open Post
                            </button>
                            `
                            :
                            ""
                        }


                        ${
                            item.groupUrl
                            ?
                            `
                            <button
                                type="button"
                                onclick="openHistoryGroup(${item.id})"
                            >
                                👥 Open Group
                            </button>
                            `
                            :
                            ""
                        }


                        ${
                            item.status === "Posted"

                            ?

                            `
                            <button
                                type="button"
                                onclick="markAsWaiting(${item.id})"
                            >
                                ↩️ Waiting
                            </button>
                            `

                            :

                            `
                            <button
                                type="button"
                                onclick="markAsPosted(${item.id})"
                            >
                                ✅ Mark Posted
                            </button>
                            `
                        }


                        <button
                            type="button"
                            onclick="deleteHistory(${item.id})"
                            class="delete-btn"
                        >
                            🗑️
                        </button>

                    </div>

                `;


                container.appendChild(
                    row
                );
            }
        );
}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

    const totalGroups =
        document.getElementById(
            "totalGroups"
        );


    const postsShared =
        document.getElementById(
            "postsShared"
        );


    const successful =
        document.getElementById(
            "successful"
        );


    const waiting =
        document.getElementById(
            "waiting"
        );


    if (totalGroups) {

        totalGroups.textContent =
            groups.length;
    }


    if (postsShared) {

        postsShared.textContent =
            history.length;
    }


    if (successful) {

        successful.textContent =
            history.filter(
                h =>
                    h.status ===
                    "Posted"
            ).length;
    }


    if (waiting) {

        waiting.textContent =
            history.filter(
                h =>
                    h.status ===
                    "Waiting"
            ).length;
    }
}


// ======================================================
// LOGIN
// ======================================================

function login() {

    alert(
        "🔐 Meta Login នឹងត្រូវភ្ជាប់នៅជំហានបន្ទាប់។"
    );
}


// ======================================================
// START APPLICATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderGroups();

        renderHistory();

        updateDashboard();

    }
);
