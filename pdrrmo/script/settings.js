/* ============================================================
   TAB SWITCHING (Responders / Users / Account Details)
============================================================ */
document.querySelectorAll(".settings-tab").forEach(tab => {
  tab.addEventListener("click", () => {

    // Remove active state from all tabs
    document.querySelectorAll(".settings-tab")
      .forEach(t => t.classList.remove("active"));

    // Activate clicked tab
    tab.classList.add("active");

    // Hide all panels
    document.querySelectorAll(".settings-panel")
      .forEach(panel => panel.classList.remove("active"));

    // Show selected panel
    const target = tab.getAttribute("data-tab");
    document.getElementById(target).classList.add("active");
  });
});


/* ============================================================
   OPEN ADD RESPONDER MODAL
============================================================ */
const addResponderModal = document.getElementById("addResponderModal");
const openAddResponderBtn = document.getElementById("openAddResponder");

openAddResponderBtn.addEventListener("click", () => {
  addResponderModal.classList.remove("hidden");
});


/* ============================================================
   CLOSE ADD RESPONDER MODAL
============================================================ */
const closeAddResponderBtn = document.getElementById("closeAddResponder");

function closeResponderModal() {
  addResponderModal.classList.add("hidden");
}

closeAddResponderBtn.addEventListener("click", closeResponderModal);


/* Close when clicking outside modal */
addResponderModal.addEventListener("click", (e) => {
  if (e.target.id === "addResponderModal") {
    closeResponderModal();
  }
});

/* Close on ESC key */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeResponderModal();
  }
});


/* ============================================================
   LOGO PREVIEW
============================================================ */
const logoInput = document.getElementById("responderLogo");
const logoPreview = document.getElementById("logoPreview");

logoInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    logoPreview.src = URL.createObjectURL(file);
  }
});


/* ============================================================
   SAVE RESPONDER (Sample Logic)
============================================================ */
const saveResponderBtn = document.getElementById("saveResponder");

saveResponderBtn.addEventListener("click", () => {
  const name = document.getElementById("responderName").value.trim();
  const email = document.getElementById("responderEmail").value.trim();
  const contact = document.getElementById("responderContact").value.trim();

  // Required fields
  if (!name || !email) {
    alert("Responder Name and Email Address are required.");
    return;
  }

  // Placeholder for future Firestore integration
  console.log("Saving responder:", {
    name,
    email,
    contact
  });

  // Close modal after saving
  closeResponderModal();
});