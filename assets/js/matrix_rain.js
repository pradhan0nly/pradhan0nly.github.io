(function () {
  var storageKey = "matrixRain";
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var enabled = localStorage.getItem(storageKey) !== "off";
  if (prefersReducedMotion && localStorage.getItem(storageKey) === null) {
    enabled = false;
  }

  var canvas = null;
  var ctx = null;
  var animationId = null;
  var width = 0;
  var height = 0;
  var columns = [];
  var words = [];
  var columnWidth = 140;
  var fontSize = 14;
  var fillColor = "rgba(80, 255, 160, 0.35)";
  var fadeColor = "rgba(9, 12, 14, 0.18)";
  var lastReset = 0;
  var resetInterval = 14000;
  var resetDuration = 1200;
  var resetActive = false;
  var resetStart = 0;
  var speedScale = 0.85;
  var middleDown = false;

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function collectWords() {
    var source = "";
    var main = document.querySelector(".container[role='main']");
    if (main) source = (main.textContent || "").trim();
    var joined = source;
    var matches = joined.match(/[A-Za-z0-9][A-Za-z0-9'\\-]{2,}/g) || [];
    var unique = {};
    var filtered = [];
    matches.forEach(function (w) {
      var key = w.toLowerCase();
      if (!unique[key] && w.length >= 4) {
        unique[key] = true;
        filtered.push(w);
      }
    });
    if (filtered.length < 16) {
      filtered = [
        "wireless",
        "systems",
        "research",
        "optimization",
        "signals",
        "networks",
        "beamforming",
        "modeling",
        "phased",
        "channels",
        "publications",
        "experiments",
        "algorithms",
        "matrix",
      ];
    }
    return shuffle(filtered);
  }

  function setupCanvas() {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "matrix-rain";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
    }
    resize();
  }

  function resize() {
    width = window.innerWidth || document.documentElement.clientWidth;
    height = window.innerHeight || document.documentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    columns = [];
    var count = Math.max(6, Math.floor(width / columnWidth));
    for (var i = 0; i < count; i++) {
      columns.push({
        x: i * columnWidth + 20,
        y: Math.random() * height,
        speed: 0.6 + Math.random() * 1.4,
        freezeUntil: 0,
      });
    }
    if (ctx) ctx.clearRect(0, 0, width, height);
  }

  function draw() {
    var now = Date.now();
    if (!lastReset) lastReset = now;
    if (!resetActive && now - lastReset > resetInterval) {
      resetActive = true;
      resetStart = now;
    }
    var fade = fadeColor;
    if (resetActive) {
      var t = Math.min(1, (now - resetStart) / resetDuration);
      var alpha = 0.18 + t * 0.5;
      if (fadeColor.indexOf("248") !== -1) {
        alpha = 0.22 + t * 0.45;
      }
      fade = fadeColor.replace(/rgba\(([^)]+),\s*[\d.]+\)/, "rgba($1, " + alpha.toFixed(3) + ")");
      if (t >= 1) {
        resetActive = false;
        lastReset = now;
        columns.forEach(function (col) {
          col.y = -40 - Math.random() * height * 0.4;
          col.speed = 0.6 + Math.random() * 1.4;
        });
      }
    }
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, width, height);
    ctx.font = fontSize + "px monospace";
    ctx.fillStyle = fillColor;

    for (var i = 0; i < columns.length; i++) {
      var col = columns[i];
      var word = words[Math.floor(Math.random() * words.length)];
      if (!resetActive) {
        ctx.fillText(word, col.x, col.y);
      }
      if (!col.freezeUntil || now > col.freezeUntil) {
        col.y += col.speed * speedScale * fontSize * 1.2;
      }
      if (col.y > height + 40 && Math.random() > 0.98) {
        col.y = -40 - Math.random() * height * 0.2;
      }
    }
    animationId = window.requestAnimationFrame(draw);
  }

  function start() {
    if (!enabled) return;
    setupCanvas();
    words = collectWords();
    document.documentElement.classList.add("matrix-enabled");
    lastReset = 0;
    if (ctx) ctx.clearRect(0, 0, width, height);
    if (!animationId) {
      draw();
    }
  }

  function stop() {
    document.documentElement.classList.remove("matrix-enabled");
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
  }

  function updateThemeColors() {
    var html = document.documentElement;
    var theme = html.getAttribute("data-theme") || "";
    if (theme === "light") {
      fillColor = "rgba(20, 120, 70, 0.28)";
      fadeColor = "rgba(248, 245, 242, 0.22)";
    } else {
      fillColor = "rgba(80, 255, 160, 0.35)";
      fadeColor = "rgba(9, 12, 14, 0.18)";
    }
  }

  function toggle(next) {
    enabled = next;
    localStorage.setItem(storageKey, enabled ? "on" : "off");
    updateToggle();
    if (enabled) start();
    else stop();
  }

  function updateToggle() {
    var btn = document.getElementById("matrix-toggle");
    if (!btn) return;
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");
    btn.textContent = enabled ? "matrix on" : "matrix off";
  }

  window.addEventListener("resize", function () {
    if (!canvas) return;
    resize();
  });

  document.addEventListener("DOMContentLoaded", function () {
    updateThemeColors();
    updateToggle();
    if (enabled) start();
    var btn = document.getElementById("matrix-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        toggle(!enabled);
      });
    }
    document.addEventListener("click", function (e) {
      if (!enabled) return;
      if (e.target && e.target.closest && e.target.closest("a, button")) return;
      if (!columns.length) return;
      var clickX = e.clientX || 0;
      var nearest = columns[0];
      var best = Math.abs(nearest.x - clickX);
      for (var i = 1; i < columns.length; i++) {
        var d = Math.abs(columns[i].x - clickX);
        if (d < best) {
          best = d;
          nearest = columns[i];
        }
      }
      nearest.freezeUntil = Date.now() + 1400;
    });
    var observer = new MutationObserver(function () {
      updateThemeColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-theme-setting"] });

    document.addEventListener("mousedown", function (e) {
      if (e.button === 1) {
        middleDown = true;
      }
    });
    document.addEventListener("mouseup", function (e) {
      if (e.button === 1) {
        middleDown = false;
      }
    });
    document.addEventListener("wheel", function (e) {
      if (!enabled || !middleDown) return;
      e.preventDefault();
      var delta = e.deltaY || 0;
      var step = delta > 0 ? -0.1 : 0.1;
      speedScale = Math.max(0.4, Math.min(2.4, speedScale + step));
    }, { passive: false });
  });
})();
