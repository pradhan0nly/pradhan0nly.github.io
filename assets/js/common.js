$(document).ready(function () {
  function updateNavMetrics() {
    var $nav = $("#navbar");
    if (!$nav.length) return;
    var navHeight = $nav.outerHeight(true);
    document.documentElement.style.setProperty("--navbar-height", navHeight + "px");
    if ($("body").hasClass("fixed-top-nav")) {
      document.body.style.paddingTop = navHeight + "px";
    }
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
      if ($("body").hasClass("fixed-top-nav")) {
        document.body.style.paddingTop = navHeight + menuHeight + "px";
      }
    } else {
      document.body.classList.remove("navbar-expanded");
      if ($("body").hasClass("fixed-top-nav")) {
        document.body.style.paddingTop = navHeight + "px";
      }
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
});
