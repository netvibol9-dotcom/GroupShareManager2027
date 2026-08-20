// ======================================================
// GroupShare Manager2027
// script.js
// Stable Version
// ======================================================


// ======================================================
// STORAGE
// ======================================================

const GROUPS_KEY = "gsm2027_groups";
const HISTORY_KEY = "gsm2027_history";

let groups = [];
let history = [];


// ======================================================
// LOAD STORAGE
// ======================================================

function loadData() {

    try {

        const savedGroups =
            localStorage.getItem(GROUPS_KEY);

        const savedHistory =
            localStorage.getItem(HISTORY_KEY);


        groups = savedGroups
            ? JSON.parse(savedGroups)
            : [];


        history = savedHistory
            ? JSON.parse(savedHistory)
            : [];


        if (!Array.isArray(groups)) {
            groups = [];
        }


        if (!Array.isArray(history)) {
            history = [];
        }


    } catch (error) {

        console.error(
            "Storage error:",
            error
        );

        groups = [];
        history = [];
    }
}


loadData();


// ======================================================
// SAVE GROUPS
// ======================================================

function saveGroups() {

    localStorage.setItem(
        GROUPS_KEY,
        JSON.stringify(groups)
    );
}


// ======================================================
// SAVE HISTORY
// ======================================================

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


    if (
        name === null ||
        !name.trim()
    ) {
        return;
    }


    const url = prompt(
        "បញ្ចូល Facebook Group URL:"
    );


    groups.push({

        id:
            Date.now(),

        name:
            name.trim(),

        url:
            url
            ? url.trim()
            : ""

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

    const group =
        groups.find(
            function (g) {
                return String(g.id) ===
                    String(id);
            }
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
        "កែ Facebook Group URL:",
        group.url || ""
    );


    if (url === null) {
        return;
    }


    group.name =
        name.trim();


    group.url =
        url.trim();


    saveGroups();

    renderGroups();

    updateDashboard();
}


// ======================================================
// DELETE GROUP
// ======================================================

function deleteGroup(id) {

    const group =
        groups.find(
            function (g) {
                return String(g.id) ===
                    String(id);
            }
        );


    if (!group) {
        return;
    }


    const confirmed =
        confirm(
            `តើអ្នកចង់លុប "${group.name}" មែនទេ?`
        );


    if (!confirmed) {
        return;
    }


    groups =
        groups.filter(
            function (g) {
                return String(g.id) !==
                    String(id);
            }
        );


    saveGroups();

    renderGroups();

    updateDashboard();
}


// ======================================================
// OPEN GROUP
// ======================================================

function openGroup(id) {

    const group =
        groups.find(
            function (g) {
                return String(g.id) ===
                    String(id);
            }
        );


    if (!group) {
        return;
    }


    if (
        !group.url ||
        !group.url.trim()
    ) {

        alert(
            "⚠️ Group នេះមិនទាន់មាន URL ទេ។"
        );

        return;
    }


    window.open(
        group.url.trim(),
        "_blank"
    );
}


// ======================================================
// SELECT ALL
// ======================================================

function selectAllGroups() {

    document
        .querySelectorAll(
            ".group-checkbox"
        )
        .forEach(
            function (checkbox) {

                checkbox.checked =
                    true;

            }
        );
}


// ======================================================
// UNSELECT ALL
// ======================================================

function unselectAllGroups() {

    document
        .querySelectorAll(
            ".group-checkbox"
        )
        .forEach(
            function (checkbox) {

                checkbox.checked =
                    false;

            }
        );
}


// ======================================================
// GET SELECTED GROUPS
// ======================================================

function getSelectedGroups() {

    const selected =
        document.querySelectorAll(
            ".group-checkbox:checked"
        );


    return Array.from(
        selected
    )
        .map(
            function (checkbox) {

                return groups.find(
                    function (group) {

                        return String(
                            group.id
                        ) === String(
                            checkbox.value
                        );

                    }
                );

            }
        )
        .filter(Boolean);
}


// ======================================================
// COPY TEXT
// ======================================================

async function copyText(text) {

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                text
            );

            return true;
        }


    } catch (error) {

        console.warn(
            "Clipboard API failed:",
            error
        );

    }


    try {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        textarea.style.position =
            "fixed";


        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        const result =
            document.execCommand(
                "copy"
            );


        textarea.remove();


        return result;


    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );


        return false;
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

        id:
            Date.now() +
            Math.floor(
                Math.random() * 100000
            ),

        groupId:
            group.id,

        groupName:
            group.name,

        caption:
            caption,

        // IMPORTANT
        // This is the URL that will be opened
        url:
            postUrl,

        // Facebook Group URL
        groupUrl:
            group.url,

        status:
            "Waiting",

        date:
            new Date().toLocaleString()

    };
}


// ======================================================
// SHARE POST TO ONE GROUP
// ======================================================

async function sharePostToGroup(id) {

    const group =
        groups.find(
            function (g) {
                return String(g.id) ===
                    String(id);
            }
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


    if (
        !caption &&
        !postUrl
    ) {

        alert(
            "⚠️ សូមបញ្ចូល Caption ឬ Post URL ជាមុនសិន។"
        );

        return;
    }


    if (
        !group.url ||
        !group.url.trim()
    ) {

        alert(
            "⚠️ Group នេះមិនទាន់មាន URL ទេ។"
        );

        return;
    }


    let shareText =
        caption;


    if (postUrl) {

        if (shareText) {

            shareText +=
                "\n\n";

        }


        shareText +=
            postUrl;
    }


    // Copy content
    const copied =
        await copyText(
            shareText
        );


    // Save History
    const item =
        createHistoryItem(
            group,
            caption,
            postUrl
        );


    history.push(
        item
    );


    saveHistory();

    renderHistory();

    updateDashboard();


    // Open Group
    window.open(
        group.url.trim(),
        "_blank"
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
            `⚠️ Copy មិនបានស្វ័យប្រវត្តិទេ។\n\n` +
            `សូម Copy/Paste ដោយខ្លួនឯង។`
        );
    }
}


// ======================================================
// SHARE SELECTED GROUPS
// ======================================================

async function shareSelectedGroups() {

    const selected =
        getSelectedGroups();


    if (
        selected.length === 0
    ) {

        alert(
            "⚠️ សូមជ្រើសរើស Group យ៉ាងហោចណាស់ 1។"
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


    if (
        !caption &&
        !postUrl
    ) {

        alert(
            "⚠️ សូមបញ្ចូល Caption ឬ Post URL ជាមុនសិន។"
        );

        return;
    }


    let shareText =
        caption;


    if (postUrl) {

        if (shareText) {

            shareText +=
                "\n\n";

        }


        shareText +=
            postUrl;
    }


    const copied =
        await copyText(
            shareText
        );


    let saved =
        0;


    selected.forEach(
        function (group) {

            if (
                !group.url ||
                !group.url.trim()
            ) {

                return;
            }


            const item =
                createHistoryItem(
                    group,
                    caption,
                    postUrl
                );


            history.push(
                item
            );


            saved++;

        }
    );


    saveHistory();

    renderHistory();

    updateDashboard();


    if (copied) {

        alert(
            `📋 Content បាន Copy រួច!\n\n` +
            `បានជ្រើសរើស ${selected.length} Groups\n` +
            `បានរក្សាទុក ${saved} History`
        );

    } else {

        alert(
            `⚠️ Copy មិនបានស្វ័យប្រវត្តិទេ។\n\n` +
            `បានរក្សាទុក ${saved} History`
        );
    }
}


// ======================================================
// CLEAR POST
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

        caption.value =
            "";

    }


    if (postUrl) {

        postUrl.value =
            "";

    }


    unselectAllGroups();
}


// ======================================================
// MARK POSTED
// ======================================================

function markAsPosted(historyId) {

    const item =
        history.find(
            function (h) {

                return String(h.id) ===
                    String(historyId);

            }
        );


    if (!item) {
        return;
    }


    item.status =
        "Posted";


    saveHistory();

    renderHistory();

    updateDashboard();
}


// ======================================================
// MARK WAITING
// ======================================================

function markAsWaiting(historyId) {

    const item =
        history.find(
            function (h) {

                return String(h.id) ===
                    String(historyId);

            }
        );


    if (!item) {
        return;
    }


    item.status =
        "Waiting";


    saveHistory();

    renderHistory();

    updateDashboard();
}


// ======================================================
// ⭐ OPEN POST URL
// ======================================================

function openHistoryUrl(historyId) {

    const item =
        history.find(
            function (h) {

                return String(h.id) ===
                    String(historyId);

            }
        );


    if (!item) {

        alert(
            "⚠️ មិនអាចរក History នេះបានទេ។"
        );

        return;
    }


    if (
        !item.url ||
        !item.url.trim()
    ) {

        alert(
            "⚠️ History នេះមិនមាន Post URL ទេ។"
        );

        return;
    }


    window.open(
        item.url.trim(),
        "_blank"
    );
}


// ======================================================
// OPEN GROUP FROM HISTORY
// ======================================================

function openHistoryGroup(
    historyId
) {

    const item =
        history.find(
            function (h) {

                return String(h.id) ===
                    String(historyId);

            }
        );


    if (!item) {
        return;
    }


    let url =
        item.groupUrl;


    if (
        !url ||
        !url.trim()
    ) {

        const group =
            groups.find(
                function (g) {

                    return String(
                        g.id
                    ) === String(
                        item.groupId
                    );

                }
            );


        if (group) {

            url =
                group.url;
        }
    }


    if (
        !url ||
        !url.trim()
    ) {

        alert(
            "⚠️ មិនមាន Group URL ទេ។"
        );

        return;
    }


    window.open(
        url.trim(),
        "_blank"
    );
}


// ======================================================
// DELETE HISTORY
// ======================================================

function deleteHistory(
    historyId
) {

    const confirmed =
        confirm(
            "តើអ្នកចង់លុប History នេះមែនទេ?"
        );


    if (!confirmed) {
        return;
    }


    history =
        history.filter(
            function (h) {

                return String(h.id) !==
                    String(historyId);

            }
        );


    saveHistory();

    renderHistory();

    updateDashboard();
}


// ======================================================
// CLEAR ALL HISTORY
// ======================================================

function clearAllHistory() {

    if (
        history.length === 0
    ) {

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


    container.innerHTML =
        "";


    groups.forEach(
        function (group, index) {

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
                            ${escapeHTML(
                                group.name
                            )}
                        </strong>

                        <small>
                            ${
                                group.url
                                ? escapeHTML(
                                    group.url
                                )
                                : "⚠️ មិនទាន់មាន URL"
                            }
                        </small>

                    </div>

                </div>


                <div class="group-actions">

                    <button
                        type="button"
                        onclick="openGroup(${group.id})"
                        ${
                            group.url
                            ? ""
                            : "disabled"
                        }
                    >
                        🔗 Open
                    </button>


                    <button
                        type="button"
                        onclick="sharePostToGroup(${group.id})"
                        ${
                            group.url
                            ? ""
                            : "disabled"
                        }
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


    if (
        groups.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-history">

                📭 មិនទាន់មាន Facebook Group ទេ.

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


    container.innerHTML =
        "";


    if (
        history.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-history">

                🕒 មិនទាន់មាន Share History ទេ។

            </div>

        `;

        return;
    }


    history
        .slice()
        .reverse()
        .forEach(
            function (item) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "history-item";


                const status =
                    item.status ===
                    "Posted"

                    ?

                    `
                    <span class="status-posted">
                        🟢 Posted
                    </span>
                    `

                    :

                    `
                    <span class="status-waiting">
                        🟡 Waiting
                    </span>
                    `;


                const urlButton =
                    item.url &&
                    item.url.trim()

                    ?

                    `
                    <button
                        type="button"
                        onclick="openHistoryUrl('${item.id}')"
                    >
                        🔗 Open Post
                    </button>
                    `

                    :

                    `
                    <button
                        type="button"
                        disabled
                    >
                        🔗 No URL
                    </button>
                    `;


                const groupButton =
                    item.groupUrl &&
                    item.groupUrl.trim()

                    ?

                    `
                    <button
                        type="button"
                        onclick="openHistoryGroup('${item.id}')"
                    >
                        👥 Open Group
                    </button>
                    `

                    :

                    "";


                const statusButton =
                    item.status ===
                    "Posted"

                    ?

                    `
                    <button
                        type="button"
                        onclick="markAsWaiting('${item.id}')"
                    >
                        ↩️ Waiting
                    </button>
                    `

                    :

                    `
                    <button
                        type="button"
                        onclick="markAsPosted('${item.id}')"
                    >
                        ✅ Mark Posted
                    </button>
                    `;


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
                            ${escapeHTML(
                                item.caption ||
                                "No caption"
                            )}
                        </p>


                        ${
                            item.url &&
                            item.url.trim()

                            ?

                            `
                            <div class="history-url">

                                🔗

                                <span>
                                    ${escapeHTML(
                                        item.url
                                    )}
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

                        ${status}

                        ${urlButton}

                        ${groupButton}

                        ${statusButton}


                        <button
                            type="button"
                            onclick="deleteHistory('${item.id}')"
                            class="delete-btn"
                        >
                            🗑️ Delete
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
                function (item) {

                    return item.status ===
                        "Posted";

                }
            ).length;
    }


    if (waiting) {

        waiting.textContent =
            history.filter(
                function (item) {

                    return item.status ===
                        "Waiting";

                }
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
// START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadData();

        renderGroups();

        renderHistory();

        updateDashboard();

    }
);
