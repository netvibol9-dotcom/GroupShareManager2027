// ==========================================
// GroupShare Manager2027 - script.js
// ==========================================

// ---------- Storage ----------
let groups = JSON.parse(
    localStorage.getItem("groups")
) || [];

let history = JSON.parse(
    localStorage.getItem("shareHistory")
) || [];


// ==========================================
// Save Data
// ==========================================

function saveGroups() {
    localStorage.setItem(
        "groups",
        JSON.stringify(groups)
    );
}

function saveHistory() {
    localStorage.setItem(
        "shareHistory",
        JSON.stringify(history)
    );
}


// ==========================================
// Initialize
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderGroups();
        renderHistory();
        updateDashboard();

    }
);


// ==========================================
// Escape HTML
// ==========================================

function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// Add Group
// ==========================================

function addGroup() {

    const name = prompt(
        "បញ្ចូលឈ្មោះ Facebook Group:"
    );

    if (name === null || !name.trim()) {
        return;
    }

    const url = prompt(
        "បញ្ចូល Facebook Group URL:"
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


// ==========================================
// Edit Group
// ==========================================

function editGroup(id) {

    const group = groups.find(
        g => g.id === id
    );

    if (!group) return;

    const name = prompt(
        "កែឈ្មោះ Group:",
        group.name
    );

    if (name === null) return;

    const url = prompt(
        "កែ Group URL:",
        group.url
    );

    group.name = name.trim();

    group.url =
        url ? url.trim() : "";

    saveGroups();

    renderGroups();

    updateDashboard();

}


// ==========================================
// Delete Group
// ==========================================

function deleteGroup(id) {

    const group = groups.find(
        g => g.id === id
    );

    if (!group) return;

    const confirmed = confirm(
        `តើអ្នកចង់លុប "${group.name}" មែនទេ?`
    );

    if (!confirmed) return;

    groups = groups.filter(
        g => g.id !== id
    );

    saveGroups();

    renderGroups();

    updateDashboard();

}


// ==========================================
// Open Facebook Group
// ==========================================

function openGroup(id) {

    const group = groups.find(
        g => g.id === id
    );

    if (!group) return;

    if (!group.url) {

        alert(
            "⚠️ Group នេះមិនទាន់មាន URL ទេ។"
        );

        return;
    }

    window.open(
        group.url,
        "_blank"
    );
}


// ==========================================
// Render Groups
// ==========================================

function renderGroups() {

    const container =
        document.getElementById("groups");

    if (!container) return;

    container.innerHTML = "";

    groups.forEach(
        (group, index) => {

            const card =
                document.createElement("div");

            card.className =
                "group-card";

            card.innerHTML = `

                <div class="group-info">

                    <input
                        type="checkbox"
                        class="group-checkbox"
                        value="${group.id}"
                    >

                    <div>

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
                        onclick="openGroup(${group.id})"
                        ${group.url ? "" : "disabled"}
                    >
                        🔗 Open
                    </button>


                    <button
                        onclick="sharePostToGroup(${group.id})"
                        ${group.url ? "" : "disabled"}
                    >
                        📤 Share Post
                    </button>


                    <button
                        onclick="editGroup(${group.id})"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        onclick="deleteGroup(${group.id})"
                        class="delete-btn"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;

            container.appendChild(card);

        }
    );


    if (groups.length === 0) {

        container.innerHTML = `

            <div class="empty-groups">

                👥

                <p>
                    មិនទាន់មាន Group ទេ។
                </p>

                <button
                    class="add-group-btn"
                    onclick="addGroup()"
                >
                    ➕ Add Group
                </button>

            </div>

        `;
    }

}


// ==========================================
// Select All
// ==========================================

function selectAllGroups() {

    document
        .querySelectorAll(".group-checkbox")
        .forEach(
            checkbox => {

                checkbox.checked = true;

            }
        );

}


// ==========================================
// Unselect All
// ==========================================

function unselectAllGroups() {

    document
        .querySelectorAll(".group-checkbox")
        .forEach(
            checkbox => {

                checkbox.checked = false;

            }
        );

}


// ==========================================
// Share Selected Groups
// ==========================================

function sharePost() {

    const selected =
        Array.from(
            document.querySelectorAll(
                ".group-checkbox:checked"
            )
        );


    if (selected.length === 0) {

        alert(
            "⚠️ សូមជ្រើស Group យ៉ាងហោចណាស់ 1។"
        );

        return;
    }


    selected.forEach(
        checkbox => {

            sharePostToGroup(
                Number(checkbox.value)
            );

        }
    );

}


// ==========================================
// Share Post To Group
// ==========================================

async function sharePostToGroup(id) {

    const group = groups.find(
        g => g.id === id
    );

    if (!group) return;


    const caption =
        document.getElementById(
            "caption"
        )?.value.trim() || "";


    const postUrl =
        document.getElementById(
            "postUrl"
        )?.value.trim() || "";


    if (!caption && !postUrl) {

        alert(
            "⚠️ សូមបញ្ចូល Caption ឬ URL ជាមុនសិន។"
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


    // Copy Caption + URL
    try {

        await navigator.clipboard.writeText(
            shareText
        );

    } catch (error) {

        console.log(
            "Clipboard unavailable"
        );

    }


    // Save History
    history.push({

        id: Date.now(),

        groupId: group.id,

        groupName: group.name,

        caption: caption,

        url: postUrl,

        groupUrl: group.url,

        status: "Waiting",

        date:
            new Date().toLocaleString()

    });


    saveHistory();

    renderHistory();

    updateDashboard();


    // Open Facebook Group
    window.open(
        group.url,
        "_blank"
    );


    alert(
        `📋 Content បាន Copy រួច!\n\n` +
        `${group.name}\n\n` +
        `ចូល Group ហើយ Paste (Ctrl + V) ` +
        `ដើម្បីបង្ហោះ។`
    );

}


// ==========================================
// Render Share History
// ==========================================

function renderHistory() {

    const container =
        document.getElementById(
            "history"
        );

    if (!container) return;


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
                            item.url
                            ?
                            `
                            <div class="history-url">
                                🔗
                                ${escapeHTML(item.url)}
                            </div>
                            `
                            :
                            ""
                        }

                    </div>


                    <div class="history-actions">


                        ${
                            item.url
                            ?
                            `
                            <button
                                class="history-open-btn"
                                onclick="openHistoryUrl(${item.id})"
                            >
                                🔗 Open URL
                            </button>
                            `
                            :
                            `
                            <button
                                class="history-open-btn"
                                disabled
                            >
                                🔗 No URL
                            </button>
                            `
                        }


                        <span
                            class="${statusClass}"
                        >

                            ${
                                item.status === "Posted"
                                ? "🟢 Posted"
                                : "🟡 Waiting"
                            }

                        </span>


                        ${
                            item.status === "Posted"

                            ?

                            `
                            <button
                                onclick="markAsWaiting(${item.id})"
                            >
                                ↩️ Waiting
                            </button>
                            `

                            :

                            `
                            <button
                                onclick="markAsPosted(${item.id})"
                            >
                                ✅ Mark Posted
                            </button>
                            `
                        }


                        <button
                            onclick="deleteHistory(${item.id})"
                            class="delete-btn"
                        >
                            🗑️
                        </button>

                    </div>

                `;


                container.appendChild(row);

            }
        );

}


// ==========================================
// ⭐ OPEN POST URL FROM HISTORY
// ==========================================

function openHistoryUrl(historyId) {

    const item =
        history.find(
            h => h.id === historyId
        );


    if (!item) {

        alert(
            "⚠️ មិនអាចរក Share History នេះបានទេ។"
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


// ==========================================
// Mark As Posted
// ==========================================

function markAsPosted(historyId) {

    const item =
        history.find(
            h => h.id === historyId
        );


    if (!item) return;


    item.status = "Posted";


    saveHistory();

    renderHistory();

    updateDashboard();

}


// ==========================================
// Mark As Waiting
// ==========================================

function markAsWaiting(historyId) {

    const item =
        history.find(
            h => h.id === historyId
        );


    if (!item) return;


    item.status = "Waiting";


    saveHistory();

    renderHistory();

    updateDashboard();

}


// ==========================================
// Delete History
// ==========================================

function deleteHistory(historyId) {

    history =
        history.filter(
            h => h.id !== historyId
        );


    saveHistory();

    renderHistory();

    updateDashboard();

}


// ==========================================
// Clear Post Form
// ==========================================

function clearPostForm() {

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


// ==========================================
// Dashboard
// ==========================================

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
                h => h.status === "Posted"
            ).length;

    }

}


// ==========================================
// Login
// ==========================================

function login() {

    alert(
        "🔐 Meta Login នឹងត្រូវភ្ជាប់នៅជំហានបន្ទាប់។"
    );

}
