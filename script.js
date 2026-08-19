// ==============================
// GroupShare Manager 2027
// ==============================


// Login
function login() {

  alert(
    "🔐 Meta / Facebook Login\n\n" +
    "ការភ្ជាប់ Meta Login នឹងត្រូវកំណត់ " +
    "នៅជំហានបន្ទាប់។"
  );

}


// Select Group
function selectGroup(button) {

  if (button.classList.contains("selected")) {

    button.classList.remove("selected");

    button.innerText = "Select";

  } else {

    button.classList.add("selected");

    button.innerText = "Selected";

  }

  updateGroupCount();

}


// Count selected groups
function updateGroupCount() {

  const selected =
    document.querySelectorAll(
      ".group button.selected"
    ).length;

  document.getElementById(
    "totalGroups"
  ).innerText = selected;

}


// Share Post
function sharePost() {

  const caption =
    document.getElementById(
      "caption"
    ).value.trim();

  const url =
    document.getElementById(
      "postUrl"
    ).value.trim();


  if (!caption) {

    alert(
      "⚠️ សូមបញ្ចូល Caption ជាមុនសិន។"
    );

    return;
  }


  if (!url) {

    alert(
      "⚠️ សូមបញ្ចូល Post / Website URL។"
    );

    return;
  }


  const selectedGroups =
    document.querySelectorAll(
      ".group button.selected"
    ).length;


  if (selectedGroups === 0) {

    alert(
      "⚠️ សូមជ្រើសរើសយ៉ាងហោចណាស់ 1 Group។"
    );

    return;
  }


  alert(
    "✅ Post ត្រូវបានរៀបចំរួច!\n\n" +
    "Groups: " +
    selectedGroups +
    "\n\n" +
    "ការផ្ញើទៅ Facebook Groups " +
    "នឹងដំណើរការបន្ទាប់ពីភ្ជាប់ Meta API។"
  );


  let current =
    parseInt(
      document.getElementById(
        "postsShared"
      ).innerText
    ) || 0;


  document.getElementById(
    "postsShared"
  ).innerText = current + 1;

}


// Initial setup
document.addEventListener(
  "DOMContentLoaded",
  function() {

    updateGroupCount();

  }
);
