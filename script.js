// ==========================================
// GroupShare Manager 2027
// Version 3.0
// ==========================================

const STORAGE_KEY = "groupShareManager2027_groups";
const POSTS_KEY = "groupShareManager2027_posts";


// ==========================================
// LOAD DATA
// ==========================================

let groups =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
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

let posts =
    JSON.parse(localStorage.getItem(POSTS_KEY)) || [];


// ==========================================
// SAVE GROUPS
// ==========================================

function saveGroups() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(groups)
    );
}


// ==========================================
// SAVE POSTS
// ==========================================

function savePosts() {
    localStorage.setItem(
        POSTS_KEY,
        JSON.stringify(posts)
    );
}


// ==========================================
// ADD GROUP
// ==========================================

function addGroup() {

    const name = prompt(
        "បញ្ចូលឈ្មោះ Facebook Group:"
    );

    if (!name || !name.trim()) {
        return;
    }

    const url = prompt(
        "បញ្ចូល Facebook Group URL:\n\n" +
        "ឧទាហរណ៍:\n" +
        "https://www.facebook.com/groups/example"
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
// EDIT GROUP
// ==========================================

function editGroup(id) {

    const group =
        groups.find(g => g.id === id);

    if (!group) return;


    const newName = prompt(
        "កែឈ្មោះ Group:",
        group.name
    );

    if (newName === null) {
        return;
    }


    const newUrl = prompt(
        "កែ Facebook Group URL:",
        group.url
    );

    group.name =
        newName.trim();

    group.url =
        newUrl
            ? newUrl.trim()
            : "";


    saveGroups();

    renderGroups();

    updateDashboard();
}


// ==========================================
// DELETE GROUP
// ==========================================

function deleteGroup(id) {

    const group =
        groups.find(g => g.id === id);

    if (!group) return;


    const confirmed =
        confirm(
            `តើអ្នកចង់លុប "${group.name}" មែនទេ?`
        );

    if (!confirmed) {
        return;
    }


    groups =
        groups.filter(
            g => g.id !== id
        );


    saveGroups();

    renderGroups();

    updateDashboard();
}


// ==========================================
// OPEN GROUP
// ==========================================

function openGroup(id) {

    const group =
        groups.find(g => g.id === id);

    if (!group) return;


    if (!group.url) {

        alert(
            "⚠️ Group នេះមិនទាន់មាន Link ទេ។"
        );

        return;
    }


    window.open(
        group.url,
        "_blank"
    );
}


// ==========================================
// SHARE POST TO ONE GROUP
// ==========================================

async function sharePostToGroup(id) {

    const group =
        groups.find(g => g.id === id);

    if (!group) {
        return;
    }


    // Get Caption
    const captionElement =
        document.getElementById("caption");

    // Get URL
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


    // Check content
    if (!caption && !postUrl) {

        alert(
            "⚠️ សូមបញ្ចូល Caption ឬ Post URL ជាមុនសិន។"
        );

        return;
    }


    // Check Group URL
    if (!group.url) {

        alert(
            `⚠️ "${group.name}" មិនទាន់មាន Group URL ទេ។\n\n` +
            `ចុច Edit ដើម្បីបញ្ចូល Link។`
        );

        return;
    }


    // Prepare text
    let shareText = "";


    if (caption) {
        shareText += caption;
    }


    if (postUrl) {

        if (shareText) {
            shareText += "\n\n";
        }

        shareText += postUrl;
    }


    // Open Facebook Group immediately
    window.open(
        group.url,
        "_blank"
    );


    // Copy content to clipboard
    try {

        await navigator.clipboard.writeText(
            shareText
        );


        alert(
            `📤 ${group.name}\n\n` +
            `បាន Copy Caption + Link រួចហើយ។\n\n` +
            `Facebook Group ត្រូវបានបើក។\n\n` +
            `👉 ចូលក្នុងប្រអប់ Post ហើយចុច Ctrl + V`
        );

    } catch (error) {

        alert(
            `📤 ${group.name}\n\n` +
            `Facebook Group ត្រូវបានបើក។\n\n` +
            `សូម Copy Caption + Link ដោយខ្លួនឯង។`
        );
    }
}


// ==========================================
// SELECT ALL GROUPS
// ==========================================

function selectAllGroups() {

    document
        .querySelectorAll(
            ".group-checkbox"
        )
        .forEach(
            checkbox => {
                checkbox.checked = true;
            }
        );
}


// ==========================================
// UNSELECT ALL GROUPS
// ==========================================

function unselectAllGroups() {

    document
        .querySelectorAll(
            ".group-checkbox"
        )
        .forEach(
            checkbox => {
                checkbox.checked = false;
            }
        );
}


// ==========================================
// RENDER GROUPS
// ==========================================

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
                        id="group-${group.id}"
                        value="${group.id}"
                    >

                    <div>

                        <strong>
                            ${index + 1}.
                            ${escapeHTML(group.name)}
                        </strong>

                        ${
                            group.url
                            ?
                            `<small>
                                ${escapeHTML(group.url)}
                            </small>`
                            :
                            `<small>
                                ⚠️ មិនទាន់មាន Link
                            </small>`
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


            container.appendChild(
                card
            );
        }
    );


    // Empty state
    if (groups.length === 0) {

        container.innerHTML = `

            <div class="empty-groups">

                <div style="font-size:35px;">
                    👥
                </div>

                <p>
                    មិនទាន់មាន Group ទេ។
                </p>

                <button
                    class="add-group-btn"
                    onclick="addGroup()"
                    style="margin-top:12px;"
                >
                    ➕ Add Group
                </button>

            </div>

        `;
    }
}


// ==========================================
// SHARE SELECTED GROUPS
// ==========================================

function sharePost() {

    const captionElement =
        document.getElementById(
            "caption"
        );


    const urlElement =
        document.getElementById(
            "postUrl"
        );


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
            document.querySelectorAll(
                ".group-checkbox:checked"
            )
        );


    // Validate content
    if (!caption && !postUrl) {

        alert(
            "⚠️ សូមបញ្ចូល Caption ឬ Post URL ជាមុនសិន។"
        );

        return;
    }


    // Validate groups
    if (
        selectedGroups.length === 0
    ) {

        alert(
            "⚠️ សូមជ្រើស Group យ៉ាងហោចណាស់ 1។"
        );

        return;
    }


    const selectedIds =
        selectedGroups.map(
            checkbox =>
                Number(checkbox.value)
        );


    const selectedGroupData =
        groups.filter(
            group =>
                selectedIds.includes(
                    group.id
                )
        );


    // Save post history
    const post = {

        id: Date.now(),

        caption: caption,

        url: postUrl,

        groups:
            selectedGroupData.map(
                group => group.name
            ),

        date:
            new Date().toLocaleString()

    };


    posts.push(post);

    savePosts();


    // Prepare copy text
    let shareText = "";


    if (caption) {
        shareText += caption;
    }


    if (postUrl) {

        if (shareText) {
            shareText += "\n\n";
        }

        shareText += postUrl;
    }


    // Copy
    navigator.clipboard
        .writeText(shareText)
        .catch(() => {});


    // Open groups
    selectedGroupData.forEach(
        group => {

            if (group.url) {

                window.open(
                    group.url,
                    "_blank"
                );

            }

        }
    );


    alert(
        `✅ បានរៀបចំ Post សម្រាប់ ${selectedGroupData.length} Groups។\n\n` +
        `Caption + Link ត្រូវបាន Copy រួច។\n\n` +
        `👉 ចូល Facebook Group ហើយចុច Ctrl + V`
    );


    updateDashboard();
}


// ==========================================
// CLEAR POST FORM
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
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    const totalGroups =
        document.getElementById(
            "totalGroups"
        );


    const totalPosts =
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


    if (totalPosts) {

        totalPosts.textContent =
            posts.length;

    }


    if (successful) {

        successful.textContent =
            posts.length;

    }
}


// ==========================================
// LOGIN
// ==========================================

function login() {

    alert(
        "🔐 Login system នឹងត្រូវបន្ថែមនៅ Version បន្ទាប់។"
    );
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderGroups();

        updateDashboard();

    }
);
