$(document).ready(function () {
  function updateNavMetrics() {
    var $nav = $("#navbar");
    if (!$nav.length) return;
    var navHeight = $nav.outerHeight(true);
    document.documentElement.style.setProperty("--navbar-height", navHeight + "px");
  }

  updateNavMetrics();
  $(window).on("resize", updateNavMetrics);

  $("#navbarNav").on("shown.bs.collapse hidden.bs.collapse", function () {
    var $nav = $("#navbar");
    var navHeight = $nav.outerHeight(true);
    var menuHeight = $(this).outerHeight(true) || 0;
    document.documentElement.style.setProperty("--navbar-height", navHeight + "px");
    document.documentElement.style.setProperty("--navbar-expanded-height", navHeight + menuHeight + "px");
    if ($(this).hasClass("show")) {
      document.body.classList.add("navbar-expanded");
    } else {
      document.body.classList.remove("navbar-expanded");
    }
  });


  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let theme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (theme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // --- Smooth Scroll Reveal Animations ---
  // Safety fallback: If browser doesn't support IntersectionObserver, disable animations to keep content visible
  if (!('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('js-enabled');
    return;
  }

  // Select elements to animate
  const sectionsToReveal = document.querySelectorAll(
    "p, h1, h2, h3, h4, .card, .profile, .publications ol.bibliography li, .grid-item"
  );

  // Set up the Intersection Observer
  const revealOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px", // Trigger slightly before the element hits the very bottom of viewport
    threshold: 0.1 // Trigger when 10% of the element is visible
  };

  const revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("reveal-active");
      observer.unobserve(entry.target);
    });
  }, revealOptions);

  sectionsToReveal.forEach((el) => {
    // Avoid animating elements inside terminal
    if (!el.closest('.terminal-nav')) {
      revealObserver.observe(el);
    }
  });

});
