(function () {
  var tableBody = document.getElementById("lc-table-body");
  var scoreEl = document.getElementById("lc-score");
  var autofixEl = document.getElementById("lc-autofix");
  var runBtn = document.getElementById("lc-run");
  var filterBtn = document.getElementById("lc-filter");
  var yearEl = document.getElementById("lc-year");
  var blockersOnly = false;

  var rows = [
    { pkg: "web-app", rules: "strict-promises", status: "in_progress", issues: 34, owner: "Isaac" },
    { pkg: "admin-portal", rules: "a11y-core", status: "blocked", issues: 12, owner: "Mercy" },
    { pkg: "api-gateway", rules: "security-baseline", status: "done", issues: 0, owner: "Tobi" },
    { pkg: "design-system", rules: "typescript-strict", status: "in_progress", issues: 9, owner: "Yahya" },
    { pkg: "mobile-web", rules: "performance-bundle", status: "blocked", issues: 5, owner: "Jemima" }
  ];

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function statusCell(status) {
    if (status === "done") return '<span class="lc-chip lc-chip--done">DONE</span>';
    if (status === "in_progress") return '<span class="lc-chip lc-chip--progress">IN PROGRESS</span>';
    return '<span class="lc-chip lc-chip--blocked">BLOCKED</span>';
  }

  function renderRows() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    rows.forEach(function (row) {
      if (blockersOnly && row.status !== "blocked") return;

      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        row.pkg +
        "</td><td>" +
        row.rules +
        "</td><td>" +
        statusCell(row.status) +
        '</td><td class="right">' +
        row.issues +
        "</td><td>" +
        row.owner +
        "</td>";
      tableBody.appendChild(tr);
    });
  }

  function randomizeCheckRun() {
    var ready = 68 + Math.floor(Math.random() * 18);
    var fix = 95 + Math.floor(Math.random() * 60);
    if (scoreEl) scoreEl.textContent = String(ready) + "%";
    if (autofixEl) autofixEl.textContent = String(fix);
  }

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      runBtn.disabled = true;
      runBtn.textContent = "Running...";
      setTimeout(function () {
        randomizeCheckRun();
        runBtn.disabled = false;
        runBtn.textContent = "Run checks";
      }, 700);
    });
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", function () {
      blockersOnly = !blockersOnly;
      filterBtn.textContent = blockersOnly ? "Show all queues" : "Show blockers only";
      renderRows();
    });
  }

  renderRows();
})();
