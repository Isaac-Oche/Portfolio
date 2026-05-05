(function () {
  var app = document.querySelector(".nw-app");
  var sidebar = document.getElementById("nw-sidebar");
  var scrim = document.getElementById("nw-scrim");
  var menuBtn = document.getElementById("nw-menu-btn");
  var closeBtn = document.getElementById("nw-sidebar-close");
  var yearEl = document.getElementById("nw-year");
  var chartSvg = document.querySelector(".nw-chart-svg");
  var gridGroup = chartSvg && chartSvg.querySelector(".nw-chart-grid");
  var areaPath = document.getElementById("nw-area");
  var linePath = document.getElementById("nw-line");
  var pointsGroup = document.getElementById("nw-points");
  var tableBody = document.getElementById("nw-table-body");
  var sortButtons = document.querySelectorAll(".nw-th-btn[data-sort]");
  var filterExcBtn = document.getElementById("nw-filter-exc");
  var pins = [document.getElementById("nw-pin-default"), document.getElementById("nw-pin-focus")];
  var segButtons = document.querySelectorAll(".nw-seg-btn");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function setDrawer(open) {
    if (!app || !menuBtn) return;
    app.classList.toggle("is-drawer-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setDrawer(!app.classList.contains("is-drawer-open"));
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", function () { setDrawer(false); });

  if (scrim) scrim.addEventListener("click", function () { setDrawer(false); });

  if (sidebar) {
    sidebar.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 980px)").matches) setDrawer(false);
      });
    });
  }

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setDrawer(false);
  });

  pins.forEach(function (btn) {
    if (!btn) return;
    btn.addEventListener("click", function () {
      pins.forEach(function (b) { if (b) b.classList.remove("is-active-pin"); });
      btn.classList.add("is-active-pin");
    });
  });

  if (pins[0]) pins[0].classList.add("is-active-pin");

  var chartValues = [42, 51, 46, 62, 58, 68, 73];
  function buildChart(scale) {
    if (!chartSvg || !gridGroup || !areaPath || !linePath || !pointsGroup) return;
    scale = scale || 1;
    var vals = chartValues.map(function (v) { return v * scale; });
    var w = 640;
    var h = 240;
    var pad = { l: 36, r: 14, t: 26, b: 34 };
    var innerW = w - pad.l - pad.r;
    var innerH = h - pad.t - pad.b;
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    var spread = max - min || 1;
    var n = vals.length;
    var stepX = innerW / Math.max(1, n - 1);

    gridGroup.innerHTML = "";
    var horiz = 5;
    for (var g = 0; g <= horiz; g++) {
      var gy = pad.t + (innerH * g) / horiz;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(pad.l));
      line.setAttribute("x2", String(w - pad.r));
      line.setAttribute("y1", String(gy));
      line.setAttribute("y2", String(gy));
      gridGroup.appendChild(line);
    }

    var pts = [];
    for (var i = 0; i < n; i++) {
      var vx = pad.l + i * stepX;
      var vy = pad.t + innerH - ((vals[i] - min) / spread) * innerH * 0.92 - innerH * 0.04;
      pts.push([vx, vy]);
    }

    var dLine = pts
      .map(function (p, idx) { return (idx === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2); })
      .join(" ");

    var last = pts[n - 1];
    var first = pts[0];
    var dArea =
      dLine +
      " L" +
      last[0].toFixed(2) +
      " " +
      (h - pad.b).toFixed(2) +
      " L" +
      first[0].toFixed(2) +
      " " +
      (h - pad.b).toFixed(2) +
      " Z";

    linePath.setAttribute("d", dLine);
    areaPath.setAttribute("d", dArea);

    pointsGroup.innerHTML = "";
    pts.forEach(function (p) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(p[0]));
      c.setAttribute("cy", String(p[1]));
      c.setAttribute("r", "5");
      pointsGroup.appendChild(c);
    });
  }

  buildChart(1);

  segButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segButtons.forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      var label = (btn.textContent || "").trim();
      if (label === "30d") buildChart(1.06);
      else if (label === "QTD") buildChart(1.12);
      else buildChart(1);
    });
  });

  var rows = [
    { ref: "NW-88421", lane: "BOS-2", status: "exception", sla: -12, owner: "Chen" },
    { ref: "NW-88104", lane: "PVD-1", status: "routing", sla: 84, owner: "Ortiz" },
    { ref: "NW-88002", lane: "BOS-1", status: "clear", sla: 220, owner: "Patel" },
    { ref: "NW-87955", lane: "PWM-1", status: "routing", sla: 55, owner: "Weiss" },
    { ref: "NW-87912", lane: "BOS-2", status: "clear", sla: 180, owner: "Nguyen" },
    { ref: "NW-87874", lane: "MHT-1", status: "at_risk", sla: 18, owner: "Chen" },
    { ref: "NW-87841", lane: "BOS-3", status: "exception", sla: -44, owner: "Kelly" },
    { ref: "NW-87792", lane: "BOS-2", status: "clear", sla: 305, owner: "Ortiz" }
  ];

  function statusBadge(s) {
    if (s === "clear") return { cls: "nw-badge--ok", label: "CLEAR" };
    if (s === "routing") return { cls: "nw-badge--ok", label: "ROUTING" };
    if (s === "at_risk") return { cls: "nw-badge--warn", label: "AT RISK" };
    return { cls: "nw-badge--bad", label: "EXCEPTION" };
  }

  function slaClass(mins) {
    if (mins < 0) return "bad";
    if (mins < 30) return "warn";
    return "good";
  }

  var excFilter = false;
  var sortState = { key: "ref", dir: "asc" };

  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    rows.forEach(function (r) {
      if (excFilter && !(r.status === "exception" || r.status === "at_risk")) return;
      var tr = document.createElement("tr");

      var bd = statusBadge(r.status);
      tr.innerHTML =
        '<td class="nw-cell-mono">' +
        r.ref +
        '</td><td class="nw-cell-mono">' +
        r.lane +
        '</td><td><span class="nw-badge ' +
        bd.cls +
        '">' +
        bd.label +
        '</span></td><td class="nw-sla-num ' +
        slaClass(r.sla) +
        '">' +
        (r.sla < 0 ? r.sla + "m" : "+" + r.sla + "m") +
        '</td><td class="nw-owner">' +
        r.owner +
        "</td>";
      tableBody.appendChild(tr);
    });
  }

  function sortRows(key, dir) {
    rows.sort(function (a, b) {
      var av = a[key];
      var bv = b[key];
      if (key === "sla") {
        return dir === "asc" ? av - bv : bv - av;
      }
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    renderTable();
  }

  renderTable();

  sortButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-sort");
      if (!key) return;
      if (sortState.key === key) {
        sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
      } else {
        sortState.key = key;
        sortState.dir = key === "sla" ? "desc" : "asc";
      }
      sortButtons.forEach(function (b) {
        b.removeAttribute("data-dir");
      });
      btn.setAttribute("data-dir", sortState.dir);
      sortRows(key, sortState.dir);
    });
  });

  var firstSort = document.querySelector('.nw-th-btn[data-sort="ref"]');
  if (firstSort) firstSort.setAttribute("data-dir", "asc");

  if (filterExcBtn) {
    filterExcBtn.addEventListener("click", function () {
      excFilter = !excFilter;
      filterExcBtn.classList.toggle("is-active-exc", excFilter);
      filterExcBtn.textContent = excFilter ? "Show all" : "Show exceptions";
      renderTable();
    });
  }
})();
