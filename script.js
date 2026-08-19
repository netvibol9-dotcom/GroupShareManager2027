// ==========================================
// GroupShareManager2027
// Group Management Script
// ==========================================

const STORAGE_KEY = "groupShareManager2027_groups";
const POSTS_KEY = "groupShareManager2027_posts";

// Default groups
let groups = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
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
];

let posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];

// ------------------------------------------
// Save Groups
// ------------------------------------------
function saveGroups() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

// ------------------------------------------
// Save Posts
// ------------------------------------------
function savePosts() {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

// ------------------------------------------
// Add Group
// ------------------------------------------
function addGroup() {
    const name = prompt("បញ្ចូលឈ្មោះ Group:");

    if (!name || !name.trim()) {
        return;
    }

    const url = prompt(
        "បញ្ចូល Facebook Group URL:\n\nឧទាហរណ៍:\nhttps://www.facebook.com/groups/example"
    );

    groups.push({
        id: Date.now(),
        name: name.trim(),
        url: url ? url.trim() : ""
    });

    saveGroups();
    renderGroups();
    updateDashboard();

    alert("បានបន្ថែម Group រួចរាល់ ✅");
}

// ------------------------------------------
// Edit Group
// ------------------------------------------
function editGroup(id) {
    const group = groups.find(g => g.id === id);

    if (!group) return;

    const newName = prompt("កែឈ្មោះ Group:", group.name);

    if (newName === null) return;

    const newUrl = prompt(
        "កែ Facebook Group URL:",
        group.url
    );

    group.name = newName.trim();
    group.url = newUrl ? newUrl.trim() : "";

    saveGroups();
    renderGroups();
    updateDashboard();
}

// ------------------------------------------
// Delete Group
// ------------------------------------------
function deleteGroup(id) {
    const group = groups.find(g => g.id === id);

    if (!group) return;

    const confirmDelete = confirm(
        `តើអ្នកពិតជាចង់លុប "${group.name}" មែនទេ?`
    );

    if (!confirmDelete) return;

    groups = groups.filter(g => g.id !== id);

    saveGroups();
    renderGroups();
    updateDashboard();
}

// ------------------------------------------
// Open Group
// ------------------------------------------
function openGroup(id) {
    const group = groups.find(g => g.id === id);

    if (!group) return;

    if (!group.url) {
        alert("Group នេះមិនទាន់មាន Link ទេ។");
        return;
    }

    window.open(group.url, "_blank");
}

// ------------------------------------------
// Select / Unselect Group
// ------------------------------------------
function toggleGroup(id) {
    const checkbox = document.getElementById(`group-${id}`);

    if (!checkbox) return;

    checkbox.checked = !checkbox.checked;
}

// ------------------------------------------
// Select All Groups
// ------------------------------------------
function selectAllGroups() {
    document
        .querySelectorAll(".group-checkbox")
        .forEach(checkbox => {
            checkbox.checked = true;
        });
}

// ------------------------------------------
// Unselect All Groups
// ------------------------------------------
function unselectAllGroups() {
    document
        .querySelectorAll(".group-checkbox")
        .forEach(checkbox => {
            checkbox.checked = false;
        });
}

// ------------------------------------------
// Render Groups
// ------------------------------------------
function renderGroups() {
    const container = document.getElementById("groups");

    if (!container) return;

    container.innerHTML = "";

    groups.forEach((group, index) => {

        const card = document.createElement("div");

        card.className = "group-card";

        card.innerHTML = `
            <div class="group-info">

                <input
                    type="checkbox"
                    class="group-checkbox"
                    id="group-${group.id}"
                    value="${group.id}"
                >

                <div>
                    <strong>${index + 1}. ${escapeHTML(group.name)}</strong>

                    ${
                        group.url
                        ? `<small>${escapeHTML(group.url)}</small>`
                        : `<small>មិនទាន់មាន Link</small>`
                    }
                </div>

            </div>

            <div class="group-actions">

                <button
                    onclick="openGroup(${group.id})"
                    ${group.url ? "" : "disabled"}
                >
                    🔗 Open
                </button>

                <button onclick="editGroup(${group.id})">
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
    });

    if (groups.length === 0) {
        container.innerHTML = `
            <div class="empty-groups">
                មិនទាន់មាន Group ទេ។
            </div>
        `;
    }
}

// ------------------------------------------
// Share Post
// ------------------------------------------
function sharePost() {

    const captionElement =
        document.getElementById("caption");

    const urlElement =
        document.getElementById("postUrl");

    const caption =
        captionElement
        ? captionElement.value.trim()
        : "";

    const postUrl =
        urlElement
        ? urlElement.value.trim()
        : "";

    const selectedGroups =
        Array.from(
            document.querySelectorAll(".group-checkbox:checked")
        );

    if (!caption && !postUrl) {
        alert("សូមបញ្ចូល Caption ឬ Post URL ជាមុនសិន។");
        return;
    }

    if (selectedGroups.length === 0) {
        alert("សូមជ្រើស Group យ៉ាងហោចណាស់ 1។");
        return;
    }

    const selectedIds =
        selectedGroups.map(
            checkbox => Number(checkbox.value)
        );

    const selectedGroupData =
        groups.filter(
            group => selectedIds.includes(group.id)
        );

    const post = {
        id: Date.now(),
        caption: caption,
        url: postUrl,
        groups: selectedGroupData.map(
            group => group.name
        ),
        date: new Date().toLocaleString()
    };

    posts.push(post);

    savePosts();

    // Open selected Facebook groups
    selectedGroupData.forEach(group => {

        if (group.url) {
            window.open(group.url, "_blank");
        }

    });

    alert(
        `បានរៀបចំ Share Post សម្រាប់ ${selectedGroupData.length} Groups ✅`
    );

    updateDashboard();
}

// ------------------------------------------
// Update Dashboard
// ------------------------------------------
function updateDashboard() {

    const totalGroups =
        document.getElementById("totalGroups");

    const totalPosts =
        document.getElementById("postsShared");

    const successful =
        document.getElementById("successful");

    if (totalGroups) {
        totalGroups.textContent = groups.length;
    }

    if (totalPosts) {
        totalPosts.textContent = posts.length;
    }

    if (successful) {
        successful.textContent = posts.length;
    }
}

// ------------------------------------------
// Escape HTML
// ------------------------------------------
function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ------------------------------------------
// Clear Post Form
// ------------------------------------------
function clearPostForm() {

    const caption =
        document.getElementById("caption");

    const postUrl =
        document.getElementById("postUrl");

    if (caption) {
        caption.value = "";
    }

    if (postUrl) {
        postUrl.value = "";
    }

    unselectAllGroups();
}

// ------------------------------------------
// Login
// ------------------------------------------
function login() {

    alert(
        "Login system នឹងត្រូវបន្ថែមនៅ Version បន្ទាប់។"
    );
}

// ------------------------------------------
// Initialize App
// ------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    renderGroups();

    updateDashboard();

});
