(function () {
  var storageKey = "terminalNav";
  var enabled = localStorage.getItem(storageKey) === "on";
  var terminal = null;
  var output = null;
  var input = null;
  var links = null;
  var toggles = [];
  var history = [];
  var historyIndex = -1;
  var tabState = { base: "", matches: [], index: 0 };
  var pages = [];
  var pageMap = {};
  var terminalOnly = {};
  var secretUnlocked = sessionStorage.getItem("terminalUnlocked") === "true";
  var puzzle = {
    blocks: [
      { key: "cv", value: "SIG" },
      { key: "about", value: "NAL" },
      { key: "hobbies", value: "-" },
      { key: "publications", value: "VAULT" },
    ],
    order: ["cv", "about", "hobbies", "publications"],
    hint: "sort nav titles by length (short to long) then decode using their first letters",
    passphrase: "signal-vault",
  };

  function parsePages() {
    var dataEl = document.getElementById("terminal-pages-data");
    if (!dataEl) return;
    try {
      pages = JSON.parse(dataEl.textContent || "[]");
      pages.forEach(function (p) {
        pageMap[p.key] = p;
        if (p.title) pageMap[p.title.toLowerCase()] = p;
        if (p.terminal_only) terminalOnly[p.key] = p;
      });
    } catch (e) {
      pages = [];
    }
  }

  function setEnabled(next) {
    enabled = next;
    localStorage.setItem(storageKey, enabled ? "on" : "off");
    document.body.classList.toggle("terminal-enabled", enabled);
    if (terminal) terminal.setAttribute("aria-hidden", enabled ? "false" : "true");
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", enabled ? "true" : "false");
    });
    if (enabled) boot();
  }

  function writeLine(text) {
    if (!output) return;
    var line = document.createElement("div");
    line.className = "terminal-line";
    line.innerHTML = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function boot() {
    if (!output || output.childNodes.length > 0) return;
    writeLine("anish@site:~$ <span class=\"terminal-inline\">boot</span>");
    writeLine("status: experimental terminal enabled");
    writeLine("modules: nav, theme");
    writeLine("type <span class=\"terminal-inline\">help</span> for commands");
    if (input) input.focus();
  }

  function setTheme(theme) {
    localStorage.setItem("theme", theme);
    location.reload();
  }

  function listPages() {
    var visible = pages.filter(function (p) { return p.nav; }).map(function (p) { return p.key; });
    if (secretUnlocked) {
      Object.keys(terminalOnly).forEach(function (key) { visible.push(key); });
    }
    return visible;
  }

  function navigateTo(key) {
    var p = pageMap[key];
    if (!p) return false;
    location.href = p.permalink;
    return true;
  }

  function runCommand(raw) {
    var cmd = (raw || "").trim();
    if (!cmd) return;
    var parts = cmd.split(/\s+/);
    var root = parts[0].toLowerCase();
    var arg = parts.slice(1).join(" ").toLowerCase();

    if (root === "help") {
      writeLine("commands: help, clear, ls, open <page>, go <page>, theme light|dark|system, whoami, time, echo, history, scan, decode <order>, unlock <passphrase>");
      return;
    }
    if (root === "clear") {
      if (output) output.innerHTML = "";
      return;
    }
    if (root === "ls") {
      writeLine("pages: " + listPages().join(" "));
      return;
    }
    if (root === "open" || root === "go") {
      if (!arg) {
        writeLine("usage: " + root + " <page>");
        return;
      }
      if (!navigateTo(arg)) {
        writeLine("unknown page: " + arg);
      }
      return;
    }
    if (pageMap[root]) {
      navigateTo(root);
      return;
    }
    if (terminalOnly[root]) {
      if (!secretUnlocked) {
        writeLine("access denied");
        return;
      }
      navigateTo(root);
      return;
    }
    if (root === "scan") {
      writeLine("scan: " + puzzle.hint);
      return;
    }
    if (root === "decode") {
      if (!arg) {
        writeLine("usage: decode <order>");
        return;
      }
      var order = arg.split(/[,\s]+/).filter(Boolean);
      var compact = arg.replace(/\s+/g, "");
      var expectedCompact = puzzle.order.map(function (k) { return k[0]; }).join("");
      var ok = (order.length === puzzle.order.length && order.every(function (v, i) { return v === puzzle.order[i]; })) ||
        (compact.length === expectedCompact.length && compact === expectedCompact);
      if (!ok) {
        writeLine("decode failed");
        return;
      }
      var phrase = puzzle.blocks.map(function (b) { return b.value; }).join("");
      writeLine("decoded: " + phrase.toLowerCase());
      return;
    }
    if (root === "unlock") {
      if (!arg) {
        writeLine("usage: unlock <passphrase>");
        return;
      }
      if (arg !== puzzle.passphrase) {
        writeLine("access denied");
        return;
      }
      secretUnlocked = true;
      sessionStorage.setItem("terminalUnlocked", "true");
      writeLine("access granted");
      writeLine("hidden: " + Object.keys(terminalOnly).join(" "));
      return;
    }
    if (root === "theme") {
      if (arg === "light" || arg === "dark" || arg === "system") {
        writeLine("theme " + arg);
        setTheme(arg);
        return;
      }
      writeLine("theme requires: light | dark | system");
      return;
    }
    if (root === "whoami") {
      writeLine("anish pradhan");
      return;
    }
    if (root === "time") {
      writeLine(new Date().toLocaleString());
      return;
    }
    if (root === "echo") {
      writeLine(parts.slice(1).join(" "));
      return;
    }
    if (root === "history") {
      var recent = history.slice(-5);
      if (!recent.length) {
        writeLine("history: empty");
      } else {
        writeLine(recent.join(" | "));
      }
      return;
    }
    writeLine("unknown command: " + cmd);
  }

  function getCompletions(value) {
    var base = value.toLowerCase();
    var commands = ["help", "clear", "ls", "open", "go", "theme", "whoami", "time", "echo", "history", "scan", "decode", "unlock"];
    var candidates = commands.concat(Object.keys(pageMap));
    if (secretUnlocked) {
      candidates = candidates.concat(Object.keys(terminalOnly));
    }
    return candidates.filter(function (c) { return c.indexOf(base) === 0; });
  }

  function handleTab(value) {
    if (tabState.base !== value) {
      tabState.base = value;
      tabState.matches = getCompletions(value);
      tabState.index = 0;
    }
    if (tabState.matches.length === 1) return tabState.matches[0] + " ";
    if (tabState.matches.length > 1) {
      var next = tabState.matches[tabState.index % tabState.matches.length];
      tabState.index += 1;
      return next;
    }
    return value;
  }

  function buildLinks() {
    if (!links) return;
    links.innerHTML = "";
    pages.filter(function (p) { return p.nav; }).forEach(function (p) {
      var btn = document.createElement("button");
      btn.className = "terminal-btn";
      btn.setAttribute("data-cmd", p.key);
      btn.textContent = "[ " + p.title + " ]";
      btn.addEventListener("click", function () {
        runCommand(p.key);
      });
      links.appendChild(btn);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    terminal = document.getElementById("terminal-nav");
    output = document.getElementById("terminal-output");
    input = document.getElementById("terminal-input");
    links = document.getElementById("terminal-links");
    toggles = Array.prototype.slice.call(document.querySelectorAll(".terminal-toggle"));

    parsePages();
    buildLinks();

    document.addEventListener("click", function (e) {
      if (e.target.closest(".terminal-toggle")) {
        setEnabled(!enabled);
      }
    });

    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var value = input.value;
          writeLine("<span class=\"terminal-inline\">$</span> " + value);
          history.push(value);
          historyIndex = history.length;
          runCommand(value);
          input.value = "";
          tabState.base = "";
          return;
        }
        if (e.key === "ArrowUp") {
          if (historyIndex > 0) historyIndex -= 1;
          input.value = history[historyIndex] || "";
          e.preventDefault();
        }
        if (e.key === "ArrowDown") {
          if (historyIndex < history.length - 1) historyIndex += 1;
          else historyIndex = history.length;
          input.value = history[historyIndex] || "";
          e.preventDefault();
        }
        if (e.key === "Tab") {
          e.preventDefault();
          input.value = handleTab(input.value.trim());
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "`") {
        setEnabled(!enabled);
      }
    });

    setEnabled(enabled);
  });
})();
