/*------ Main Js ----*/
(function ($) {
  "use strict";

  /* --------------------------------------------------------------------------
   * Envato Review Improvements
   * - Cache frequently used DOM lookups
   * - Defensive checks / error handling around optional plugins
   * - Namespace events for cleanup (memory management)
   * ------------------------------------------------------------------------ */

  // Cached selectors (performance)
  const $win = $(window);
  const $doc = $(document);
  const $body = $("body");
  const $modalOverlay = $(".modal-overlay");
  const $tabPanes = $(".tab-pane");
  const $filterButtons = $(".filter-button");
  const $filterDropdownMenus = $(".filter-dropdown-menu");
  const $filterDropdownIcons = $(".filter-dropdown-icon");
  const $searchResultContainers = $(".search-result-container");

  // Safe plugin initializer (error handling)
  function safeInit(fn) {
    try {
      fn();
    } catch (err) {
      // Silently fail in production templates; prevents broken pages if a vendor plugin is missing
      // console.warn(err);
    }
  }

  // Cleanup registry (memory management)
  const cleanupTasks = [];
  function addCleanup(task) {
    if (typeof task === "function") cleanupTasks.push(task);
  }

  /*------ Preloader ----*/
  $win.on("load.jagannathapuri", function () {
    $(".preloader").addClass("loaded");
  });

  /*------ Wow Animation ----*/
  safeInit(function () {
    if (typeof WOW !== "undefined") new WOW().init();
  });

  /*------ Nice Select ----*/
  safeInit(function () {
    if ($.fn && $.fn.niceSelect) $("select").niceSelect();
  });

  $("select").on("change.jagannathapuri", function () {
    $(this).siblings(".nice-select").addClass("changed");
  });

  /*------ Sticky Header ----*/
  const stickyHeader = $(".sticky-header");
  const win = $win;
  win.on("scroll.jagannathapuri", function () {
    if (win.scrollTop() > 200) {
      stickyHeader.addClass("sticky-top");
    } else {
      stickyHeader.removeClass("sticky-top");
    }
  });

  /*------ Product Filter Buttons ------*/
  const productFilterButtons = $(".home-one-product-filter button");
  if (productFilterButtons.length) {
    $(".home-one-product-filter button:nth-child(1)")
      .addClass("btn-primary")
      .removeClass("btn-default outline shadow-none")
      .siblings()
      .removeClass("btn-primary")
      .addClass("btn-default outline  shadow-none");
    $tabPanes.hide();

    $(".tab-pane:nth-child(1)").addClass("active").show();
    $(".home-one-product-filter button").on("click.jagannathapuri", function () {
      $(this)
        .removeClass("btn-default outline shadow-none")
        .addClass("btn-primary")
        .siblings()
        .removeClass("btn-primary")
        .addClass("btn-default outline  shadow-none");
      $tabPanes.removeClass("active fade").hide();
      let activeTab = $(this).attr("data-tab");
      $(`#${activeTab}`).addClass("active fade").fadeIn();
      return false;
    });
  }

  /*------ Sidebar ----*/
  const sidebarMenu = $("#sidebar-menu-btn");
  const sidebar = $("#sidebar");
  const sidebarMenuClose = $("#side-bar-menu-close");
  if (sidebarMenu.length) {
    sidebarMenu.on("click.jagannathapuri", function () {
      $(sidebar).attr("data-state", "open");
      $modalOverlay.attr("data-overlay-for", "#sidebar");
      $body.addClass("overflow-hidden");
      $modalOverlay.fadeIn();
    });
  }

  if (sidebarMenuClose.length) {
    sidebarMenuClose.on("click.jagannathapuri", function () {
      $(sidebar).attr("data-state", "close");
      $body.removeClass("overflow-hidden");
      $modalOverlay.fadeOut();
    });
  }

  if ($modalOverlay.length) {
    $modalOverlay.on("click.jagannathapuri", function () {
      const overlayFor = $(this).attr("data-overlay-for");
      if (overlayFor) {
        $(overlayFor).attr("data-state", "close");
      }
      $body.removeClass("overflow-hidden scrollbar-offset");
      $(this).fadeOut();
      $(this).removeAttr("data-overlay-for");
    });
  }

  /*------ Cart Sidebar ------*/
  const cartSidebarBtn = $(".cart-sidebar-btn");

  if (cartSidebarBtn.length) {
    cartSidebarBtn.on("click.jagannathapuri", function () {
      isAnythingOpen();
      showSidebar(".cart-sidebar");
    });
  }

  /*------ Register Page Button ------*/
  const registerPageBtn = $(".register-page-btn");
  if (registerPageBtn.length) {
    registerPageBtn.on("click.jagannathapuri", function (e) {
      e.preventDefault();
      isAnythingOpen();
      showSidebar(".register-page-sidebar");
    });
  }

  /*------ Login Page Button ------*/
  const loginPageBtn = $(".login-page-btn");
  if (loginPageBtn.length) {
    loginPageBtn.on("click.jagannathapuri", function (e) {
      e.preventDefault();
      isAnythingOpen();
      showSidebar(".login-page-sidebar");
    });
  }

  /*------ Forgot Password Page Button ------*/
  const forgotPasswordPageBtn = $(".forgot-password-page-btn");
  if (forgotPasswordPageBtn.length) {
    forgotPasswordPageBtn.on("click.jagannathapuri", function (e) {
      e.preventDefault();
      isAnythingOpen();
      showSidebar(".forgot-password-page-sidebar");
    });
  }

  /*------ Reset Password Page Button ------*/
  const resetPasswordPageBtn = $(".reset-password-page-btn");
  if (resetPasswordPageBtn.length) {
    resetPasswordPageBtn.on("click.jagannathapuri", function (e) {
      e.preventDefault();
      isAnythingOpen();
      showSidebar(".reset-password-page-sidebar");
    });
  }

  /*------ OTP Verification Page Button ------*/
  const otpVerificationPageBtn = $(".otp-verification-page-btn");
  if (otpVerificationPageBtn.length) {
    otpVerificationPageBtn.on("click.jagannathapuri", function (e) {
      e.preventDefault();
      isAnythingOpen();
      showSidebar(".otp-verification-page-sidebar");
    });
  }

  /*------ Close Sidebar ------*/
  const closeSidebarBtn = $(".close-sidebar-btn");
  if (closeSidebarBtn.length) {
    closeSidebarBtn.on("click.jagannathapuri", function () {
      const sidebarFor = $(this).attr("data-close-sidebar");
      isAnythingOpen();
      closeSidebar(sidebarFor);
    });
  }

  /*------ Explorer Category ------*/
  const btn = $("#dropdownButton");
  const menu = $("#dropdownMenu");
  const icon = $("#dropdownIcon");

  btn.on("click.jagannathapuri", function () {
    const isOpen = $(this).attr("data-state") === "open";
    if (isOpen) {
      $(this).attr("data-state", "close");
      menu.removeClass("active").addClass("hide");
      icon.removeClass("rotate-180");
    } else {
      btn.attr("data-state", "open");
      menu.removeClass("hide").addClass("active");
      icon.addClass("rotate-180");
    }
  });

  $doc.on("click.jagannathapuri", function (e) {
    if (!$(e.target).closest("#dropdownButton").length) {
      btn.attr("data-state", "close");
      menu.removeClass("active").addClass("hide");
      icon.removeClass("rotate-180");
    }
    // Banner Filter Dropdown Close
    if (!$(e.target).closest(".filter-dropdown").length) {
      $filterButtons.attr("data-state", "close");
      $filterButtons.removeClass(
        "ring-primary text-primary transition-colors duration-300 ease-in-out"
      );
      $filterButtons.find("span i").removeClass(
        "text-primary transition-colors duration-300 ease-in-out"
      );
      $filterDropdownMenus.removeClass("active").addClass("hide");
      $filterDropdownIcons.removeClass(
        "rotate-180 text-primary transition-colors duration-300 ease-in-out"
      );
    }

    if (!$(e.target).closest(".search-input-container").length) {
      $searchResultContainers.attr("data-state", "close");
    }
  });

  /*------ jagannathapuri Countdown ----*/
  const jagannathapuriCountdown = $(".jagannathapuri-countdown");
  if (jagannathapuriCountdown.length) {
    let countdownDate = jagannathapuriCountdown.data("countdown-date");

    // Convert YYYY-MM-DDTHH:MM to MM/DD/YYYY HH:MM:SS for the plugin
    if (countdownDate && countdownDate.includes('T')) {
      const parts = countdownDate.split('T');
      const dateParts = parts[0].split('-');
      countdownDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]} ${parts[1]}:00`;
    }

    safeInit(function () {
      if ($.fn && $.fn.countdown) {
        jagannathapuriCountdown.countdown({
          date: countdownDate || "12/13/2026 00:00:00",
          offset: +6,
          day: "Day",
          days: "Days",
          hideOnComplete: true,
        });
      }
    });
  }

  /*------ Search Flow ----*/
  let searchTimer;

  $(".header-search-input").on("input.jagannathapuri", function () {
    const $input = $(this);
    const $container = $input.closest(".search-input-container").find(".search-result-container");
    const query = $input.val().trim();

    clearTimeout(searchTimer);

    if (query.length < 2) {
      $container.attr("data-state", "close");
      return;
    }

    $container.attr("data-state", "open");
    $container.html('<div class="p-4 text-center"><p class="text-light-secondary-text">Searching...</p></div>');

    searchTimer = setTimeout(() => {
      $.get(`/api/search?q=${encodeURIComponent(query)}`, function (response) {
        if (response.success) {
          renderSearchResults($container, response.results, query);
        }
      });
    }, 500);
  });

  const renderSearchResults = ($container, results, query) => {
    const { products, services, library } = results;
    const totalResults = products.length + services.length + library.length;

    if (totalResults === 0) {
      $container.html(`<div class="p-4 text-center"><p class="text-light-secondary-text">No results found for "${query}"</p></div>`);
      return;
    }

    let html = `
      <div class="search-results-wrapper max-h-[400px] overflow-y-auto custom-scrollbar">
    `;

    if (products.length > 0) {
      html += `
        <div class="mb-4">
          <p class="text-xs font-bold uppercase text-light-disabled-text mb-2 px-2">Products</p>
          <div class="flex flex-col gap-y-2">
            ${products.map(p => {
        let image = '/assets/images/logo.png';
        if (p.images && p.images.length > 0) {
          const img = p.images[0].trim();
          image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
        }
        return `
                <a href="/product-details/${p.slug}" class="flex items-center gap-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <div class="size-10 bg-[#F4F3F5] rounded-lg overflow-hidden flex-none">
                    <img src="${image}" alt="${p.product_name}" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-light-primary-text truncate">${p.product_name}</p>
                    <p class="text-xs text-primary font-bold">₹${parseFloat(p.price_amount).toFixed(2)}</p>
                  </div>
                </a>
              `;
      }).join('')}
          </div>
        </div>
      `;
    }

    if (services.length > 0) {
      html += `
        <div class="mb-4">
          <p class="text-xs font-bold uppercase text-light-disabled-text mb-2 px-2">Services</p>
          <div class="flex flex-col gap-y-2">
            ${services.map(s => {
        let image = s.image;
        if (image) {
          image = (image.startsWith('http') || image.startsWith('/')) ? image : '/uploads/' + image;
        }
        return `
                <a href="/service" class="flex items-center gap-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <div class="size-10 bg-[#F4F3F5] rounded-lg overflow-hidden flex-none flex items-center justify-center">
                    ${image ? `<img src="${image}" class="w-full h-full object-cover">` : `<i class="${s.icon || 'hgi hgi-stroke hgi-service'} text-xl text-primary"></i>`}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-light-primary-text truncate">${s.title}</p>
                    <p class="text-xs text-light-disabled-text">Mandir Service</p>
                  </div>
                </a>
              `;
      }).join('')}
          </div>
        </div>
      `;
    }

    if (library.length > 0) {
      html += `
        <div class="mb-4">
          <p class="text-xs font-bold uppercase text-light-disabled-text mb-2 px-2">Library</p>
          <div class="flex flex-col gap-y-2">
            ${library.map(l => {
        let image = '/assets/images/logo.png';
        if (l.image) {
          const img = l.image.trim();
          image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
        }
        return `
                <a href="/library/${l.slug}" class="flex items-center gap-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <div class="size-10 bg-[#F4F3F5] rounded-lg overflow-hidden flex-none">
                    <img src="${image}" alt="${l.title}" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-light-primary-text truncate">${l.title}</p>
                    <p class="text-xs text-light-disabled-text">Spiritual Content</p>
                  </div>
                </a>
              `;
      }).join('')}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    $container.html(html);
  };

  /*------ Accordion Section ----*/
  $(".accordion-header").on("click.jagannathapuri", function () {
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
      $(this).siblings(".accordion-body").slideUp();
    } else {
      $(this)
        .parent()
        .siblings()
        .children(".accordion-header")
        .removeClass("active");
      $(this).parent().siblings().children(".accordion-body").slideUp();
      $(this).addClass("active");
      $(this).siblings(".accordion-body").slideDown();
    }
  });

  /*------ FAQ Tab Accordion ----*/
  const faqFilterButton = $(".faq-filter button");
  if (faqFilterButton.length) {
    $(".faq-filter button:nth-child(1)")
      .addClass("active")
      .siblings()
      .removeClass("active");
    $(".faq-tab-pane").hide();
    $(".faq-tab-pane:nth-child(1)").addClass("active").show();

    faqFilterButton.on("click.jagannathapuri", function () {
      $(this).addClass("active").siblings().removeClass("active");
      $(".faq-tab-pane").removeClass("active fade").hide();
      let activeTab = $(this).attr("data-tab");
      $(`#${activeTab}`).addClass("active fade").fadeIn();
    });
  }

  /*------ Mobile Menu ----*/
  const mobileMenu = $(".mobile-menu");
  if (mobileMenu.length) {
    mobileMenu
      .find("ul li")
      .parents(".mobile-menu ul li")
      .addClass("has-sub-item")
      .prepend('<span class="submenu-button"></span>'),
      mobileMenu.find(".submenu-button").on("click.jagannathapuri", function () {
        $(this).toggleClass("submenu-opened");
        $(this).siblings("ul").hasClass("open")
          ? $(this).siblings("ul").removeClass("open").slideUp("fast")
          : $(this).siblings("ul").addClass("open").slideDown("fast");
      });
  }

  /*------ Main Menu ----*/
  const mainMenu = $(".main-menu");
  if (mainMenu.length) {
    mainMenu.find("ul li").parents(".main-menu ul li").addClass("has-sub-item");
    mainMenu
      .find("ul li.has-sub-item > a")
      .append(
    );
  }

  /*------ Payment Method ----*/
  const paymentMethod = $(".payment-methods input[name='payment-method']");
  const selectedPaymentMethod = $(
    ".payment-methods input[name='payment-method']:checked"
  );
  if (selectedPaymentMethod.length) {
    selectedPaymentMethod.parents(".payment-method").addClass("selected");
    selectedPaymentMethod
      .parents(".payment-method")
      .find(".payment-content")
      .show();
  }
  if (paymentMethod.length) {
    paymentMethod.on("change.jagannathapuri", function () {

      $(this).parents(".payment-method").siblings().removeClass("selected");
      $(this).parents(".payment-method").addClass("selected");
      $(this)
        .parents(".payment-method")
        .siblings()
        .find(".payment-content")
        .slideUp();
      $(this).parents(".payment-method").find(".payment-content").slideDown();
    });
  }

  /*------ Home Five Product Filter Buttons ------*/
  const homeFiveProductFilterButtons = $(".home-five-product-filter button");
  if (homeFiveProductFilterButtons.length) {
    $(".home-five-product-filter button:nth-child(1)")
      .addClass("btn-primary")
      .removeClass("btn-default outline shadow-none")
      .siblings()
      .removeClass("btn-primary")
      .addClass("btn-default outline shadow-none");
    $(".tab-pane").hide();

    $(".tab-pane:nth-child(1)").addClass("active").show();
    $(".home-five-product-filter button").on("click.jagannathapuri", function () {
      $(this)
        .removeClass("btn-default outline shadow-none")
        .addClass("btn-primary")
        .siblings()
        .removeClass("btn-primary")
        .addClass("btn-default outline shadow-none");
      $(".tab-pane").removeClass("active fade").hide();
      let activeTab = $(this).attr("data-tab");
      $(`#${activeTab}`).addClass("active fade").fadeIn();
      return false;
    });
  }

  /*------ Home Five Variation Color Buttons ------*/
  const homeFiveVariationColorButtons = $(".variation-color-item button");
  if (homeFiveVariationColorButtons.length) {
    homeFiveVariationColorButtons.on("click.jagannathapuri", function () {
      const color = $(this).data("color");
      $(this).parent().css("border-color", color);
      $(this).parent().siblings().css("border-color", "#dfe3e8");
      $(this).parent().siblings().find("i").addClass("hidden");
      $(this).find("i").removeClass("hidden");
    });
  }

  /*------ Is Anything Open ------*/
  function isAnythingOpen() {
    const isAnythingOpen = $modalOverlay.attr("data-overlay-for");
    if (isAnythingOpen) {
      $(isAnythingOpen).attr("data-state", "close");
    }
  }

  /*------ Show Sidebar ------*/
  function showSidebar(sidebarFor) {
    $(sidebarFor).attr("data-state", "open");
    $body.addClass("overflow-hidden scrollbar-offset");
    $modalOverlay.fadeIn();
    $modalOverlay.attr("data-overlay-for", sidebarFor);
  }

  /*------ Close Sidebar ------*/
  function closeSidebar(sidebarFor) {
    $(sidebarFor).attr("data-state", "close");
    $body.removeClass("overflow-hidden scrollbar-offset");
    $modalOverlay.fadeOut();
    $modalOverlay.removeAttr("data-overlay-for");
  }


  /*------ About Us Page Counter Up ------*/
  safeInit(function () {
    if (!window.counterUp || !window.counterUp.default) return;
    if (typeof IntersectionObserver === "undefined") return;

    const counterUp = window.counterUp.default;

    const callback = (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting && !el.classList.contains("is-visible")) {
          safeInit(function () {
            counterUp(el, { duration: 2000, delay: 16 });
          });
          el.classList.add("is-visible");
        }
      });
    };

    const IO = new IntersectionObserver(callback, { threshold: 1 });
    addCleanup(function () {
      try {
        IO.disconnect();
      } catch (e) { }
    });

    const els = document.querySelectorAll(".about-us-counter");
    if (!els || !els.length) return;
    els.forEach((el) => IO.observe(el));
  });

  /*------ About Us Page Video Popup ------*/

  safeInit(function () {
    if ($.fn && $.fn.magnificPopup) {
      $(".about-us-popup-youtube").magnificPopup({
        type: "iframe",

        iframe: {
          markup:
            '<div class="mfp-iframe-scaler">' +
            '<div class="mfp-close"></div>' +
            '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
            "</div>", // HTML markup of popup, `mfp-close` will be replaced by the close button

          patterns: {
            youtube: {
              index: "youtube.com/",
              id: "v=",
              src: "//www.youtube.com/embed/%id%?autoplay=1",
            },
            vimeo: {
              index: "vimeo.com/",
              id: "/",
              src: "//player.vimeo.com/video/%id%?autoplay=1",
            },
            gmaps: {
              index: "//maps.google.",
              src: "%id%&output=embed",
            },
          },

          srcAction: "iframe_src",
        },
      });
    }
  });

  /*------ Price Range Slider Widget ------*/
  const priceRangeSlider = document.getElementById("price-range-slider");
  if (priceRangeSlider) {
    safeInit(function () {
      if (typeof noUiSlider === "undefined") return;
      const min = parseInt(priceRangeSlider.dataset.min) || 0;
      const max = parseInt(priceRangeSlider.dataset.max) || 1000;
      const startMin = parseInt(priceRangeSlider.dataset.startMin) || min;
      const startMax = parseInt(priceRangeSlider.dataset.startMax) || max;

      noUiSlider.create(priceRangeSlider, {
        start: [startMin, startMax],
        connect: true,
        range: {
          min: min,
          max: max,
        },
        // make numbers whole
        format: {
          to: (value) => value,
          from: (value) => value,
        },
      });

      priceRangeSlider.noUiSlider.on("update", (values) => {
        let minVal = parseFloat(values[0]);
        let maxVal = parseFloat(values[1]);
        if (isNaN(minVal)) minVal = 0;
        if (isNaN(maxVal)) maxVal = 1000;
        $(".price-range-min-value").val(minVal.toFixed(0));
        $(".price-range-max-value").val(maxVal.toFixed(0));
      });

      priceRangeSlider.noUiSlider.on("change", (values) => {
        $("#shopFilterForm").submit();
      });

      addCleanup(function () {
        try {
          if (priceRangeSlider.noUiSlider) priceRangeSlider.noUiSlider.destroy();
        } catch (e) { }
      });
    });
  }

  /*------ Star Rating Widget ------*/
  $(".widget-rating a").on("click.jagannathapuri", function (e) {
    e.preventDefault();
    $(this).parent().siblings().find("a").removeClass("active");
    $(this).addClass("active");
  });

  /*------ Color Picker Widget ------*/
  $(".widget-color-picker button").on("click.jagannathapuri", function () {
    $(this).parent().siblings().find("button").removeClass("active");
    $(this).addClass("active");
  });

  /*------ Size Picker Widget ------*/
  $(".widget-size-picker button").on("click.jagannathapuri", function () {
    $(this).parent().siblings().find("button").removeClass("active");
    $(this).addClass("active");
  });

  /*------ Product Details Tabs Section ------*/
  const productDetailsTabs = $("#product-details-tabs button");
  if (productDetailsTabs.length) {
    productDetailsTabs.on("click.jagannathapuri", function () {
      $(this)
        .addClass("active")
        .parent()
        .siblings()
        .find("button")
        .removeClass("active");
      $(".product-details-tab").removeClass("active fade").hide();
      let activeTab = $(this).attr("data-tab");
      $(`#${activeTab}`).addClass("active fade").fadeIn();
    });
  }

  /*------ Product Details Color Variation ------*/
  const productDetailsColorVariation = $(".color-variation-item button");
  if (productDetailsColorVariation.length) {
    productDetailsColorVariation.on("click.jagannathapuri", function () {
      $(this).css("border-color", $(this).attr("data-color"));
      $(this).parent().siblings().find("button").css("border-color", "#dfe3e8");
      $(".color-variation-selected-color").text(
        $(this).attr("data-color-text")
      );
    });
  }

  /*------ Product Details Color Variation ------*/
  const productDetailsSizeVariation = $(".size-variation-item button");
  if (productDetailsSizeVariation.length) {
    productDetailsSizeVariation.on("click.jagannathapuri", function () {
      $(this).addClass("border-primary bg-primary hover:bg-primary text-white");
      $(this)
        .parent()
        .siblings()
        .find("button")
        .removeClass("border-primary bg-primary hover:bg-primary text-white")
        .addClass("border-gray-300 text-light-primary-text");
      $(".size-variation-selected-size").text($(this).attr("data-size-text"));
    });
  }

  /*------ Product Details Size Variation Modal ------*/
  const productDetailsSizeVariationModal = $(".variation-size-guide-btn");
  if (productDetailsSizeVariationModal.length) {
    productDetailsSizeVariationModal.on("click.jagannathapuri", function (e) {
      e.preventDefault();
      isAnythingOpen();
      showSidebar(".size-variation-modal");
    });
  }

  /*------ Product Details Height Range Slider Widget ------*/
  const heightRangeSlider = document.querySelector("#height-range-slider");
  if (heightRangeSlider) {
    safeInit(function () {
      if (typeof noUiSlider === "undefined") return;
      noUiSlider.create(heightRangeSlider, {
        start: 80,
        connect: "lower",
        range: {
          min: 0,
          max: 200,
        },
        // make numbers whole
        format: {
          to: (value) => value,
          from: (value) => value,
        },
      });

      heightRangeSlider.noUiSlider.on("update", (values) => {
        $(".height-range-slider-value").text(values[0].toFixed(0));
      });

      addCleanup(function () {
        try {
          if (heightRangeSlider.noUiSlider) heightRangeSlider.noUiSlider.destroy();
        } catch (e) { }
      });
    });
  }

  /*------ Product Details Weight Range Slider Widget ------*/
  const weightRangeSlider = document.querySelector("#weight-range-slider");
  if (weightRangeSlider) {
    safeInit(function () {
      if (typeof noUiSlider === "undefined") return;
      noUiSlider.create(weightRangeSlider, {
        start: 80,
        connect: "lower",
        range: {
          min: 0,
          max: 200,
        },
        // make numbers whole
        format: {
          to: (value) => value,
          from: (value) => value,
        },
      });

      weightRangeSlider.noUiSlider.on("update", (values) => {
        $(".weight-range-slider-value").text(values[0].toFixed(0));
      });

      addCleanup(function () {
        try {
          if (weightRangeSlider.noUiSlider) weightRangeSlider.noUiSlider.destroy();
        } catch (e) { }
      });
    });
  }

  /*------ Home Four Product Filter Buttons ------*/
  const homeFourProductFilterButtons = $(".home-four-product-filter button");
  if (homeFourProductFilterButtons.length) {
    $(".home-four-product-filter button:nth-child(1)")
      .addClass(
        "text-light-primary-text border-b-2 border-[text-light-primary-text] bg-transparent font-semibold"
      )
      .removeClass("bg-transparent")
      .siblings()
      .removeClass(
        "text-light-primary-text border-b-2 border-[text-light-primary-text] bg-transparent font-semibold"
      )
      .addClass("bg-transparent");
    $("#deal-tab-content .tab-pane").hide();

    $("#deal-tab-content .tab-pane:nth-child(1)").addClass("active").show();
    $(".home-four-product-filter button").on("click.jagannathapuri", function () {
      $(this)
        .removeClass("bg-transparent")
        .addClass(
          "text-light-primary-text border-b-2 border-[text-light-primary-text] bg-transparent font-semibold"
        )
        .siblings()
        .removeClass(
          "text-light-primary-text border-b-2 border-[text-light-primary-text] bg-transparent font-semibold"
        )
        .addClass("bg-transparent");
      $("#deal-tab-content .tab-pane").removeClass("active fade").hide();
      let activeTab = $(this).attr("data-tab");
      $(`#${activeTab}`).addClass("active fade").fadeIn();
      return false;
    });
  }

  /*------ Home Four Category Filter Buttons ------*/
  const homeFourCategoryFilterButtons = $(".home-four-category-filter button");
  if (homeFourCategoryFilterButtons.length) {
    $(".home-four-category-filter button:nth-child(1)")
      .addClass("text-primary bg-transparent")
      .removeClass("bg-transparent")
      .siblings()
      .removeClass("text-primary bg-transparent")
      .addClass("bg-transparent");
    $("#category-tab-content .tab-pane").hide();

    $("#category-tab-content .tab-pane:nth-child(1)").addClass("active").show();
    $(".home-four-category-filter button").on("click.jagannathapuri", function () {
      $(this)
        .removeClass("bg-transparent")
        .addClass("text-primary bg-transparent")
        .siblings()
        .removeClass("text-primary bg-transparent")
        .addClass("bg-transparent");
      $("#category-tab-content .tab-pane").removeClass("active fade").hide();
      let activeTab = $(this).attr("data-tab");
      $(`#${activeTab}`).addClass("active fade").fadeIn();
      return false;
    });
  }

  /*------ Home Two Product Filter Buttons ------*/
  const homeTwoProductFilterButtons = $(".home-two-product-filter button");
  if (homeTwoProductFilterButtons.length) {
    $(".home-two-product-filter button:nth-child(1)")
      .addClass("btn-primary")
      .removeClass("btn-default outline shadow-none")
      .siblings()
      .removeClass("btn-primary")
      .addClass("btn-default outline  shadow-none");
    $(".tab-pane").hide();

    $(".tab-pane:nth-child(1)").addClass("active").show();
    $(".home-two-product-filter button").on("click.jagannathapuri", function () {
      $(this)
        .removeClass("btn-default outline shadow-none")
        .addClass("btn-primary")
        .siblings()
        .removeClass("btn-primary")
        .addClass("btn-default outline  shadow-none");
      $(".tab-pane").removeClass("active fade").hide();
      let activeTab = $(this).attr("data-tab");
      $(`#${activeTab}`).addClass("active fade").fadeIn();
      return false;
    });
  }

  /*------ Order History Filter Buttons ------*/
  const orderHistoryProductFilterButtons = $(
    ".order-history-product-filter button"
  );
  if (orderHistoryProductFilterButtons.length) {
    $(".order-history-product-filter button:nth-child(1)")
      .addClass("bg-primary/8 text-primary ")
      .removeClass("text-light-primary-text")
      .siblings()
      .removeClass("bg-primary/8 text-primary")
      .addClass("text-light-primary-text");
    $("#order-tab-content .tab-pane").hide();

    $("#order-tab-content .tab-pane:nth-child(1)").addClass("active").show();
    $(".order-history-product-filter button").on("click.jagannathapuri", function () {
      $(this)
        .removeClass("text-light-primary-text")
        .addClass("bg-primary/8 text-primary")
        .siblings()
        .removeClass("bg-primary/8 text-primary")
        .addClass("text-light-primary-text");
      $("#order-tab-content .tab-pane").removeClass("active fade").hide();
      let activeTab = $(this).attr("data-tab");
      $(`#${activeTab}`).addClass("active fade").fadeIn();
      return false;
    });
  }

  /*------ My Account Navigation Buttons ------*/
  const myAccountMenuButton = $(".my-account-menu button");
  if (myAccountMenuButton.length) {
    myAccountMenuButton.on("click.jagannathapuri", function () {
      if ($(this).data("tab") === "logout") {
        return false;
      }
      $(this)
        .addClass("active")
        .parent()
        .siblings()
        .find("button")
        .removeClass("active");
      $(".menu-tab-pane").removeClass("active fade").addClass("hidden");
      let activeTab = $(this).attr("data-tab");
      $(".my-account-content")
        .find(`#${activeTab}`)
        .removeClass("hidden")
        .addClass("active fade")
        .fadeIn();
    });
  }

  $(".order-details-button").on("click.jagannathapuri", function () {
    $(".menu-tab-pane").removeClass("active fade").addClass("hidden");
    $("#order-details").removeClass("hidden").addClass("active fade").fadeIn();
  });

  $(".order-details-back-button").on("click.jagannathapuri", function () {
    $(".menu-tab-pane").removeClass("active fade").addClass("hidden");
    $("#orders").removeClass("hidden").addClass("active fade").fadeIn();
  });

  $(".add-new-address-button").on("click.jagannathapuri", function () {
    $(".menu-tab-pane").removeClass("active fade").addClass("hidden");
    $("#add-address").removeClass("hidden").addClass("active fade").fadeIn();
  });

  $(".add-new-address-back-button").on("click.jagannathapuri", function () {
    $(".menu-tab-pane").removeClass("active fade").addClass("hidden");
    $("#address").removeClass("hidden").addClass("active fade").fadeIn();
  });

  $(".edit-address-button").on("click.jagannathapuri", function () {
    $(".menu-tab-pane").removeClass("active fade").addClass("hidden");
    $("#edit-address").removeClass("hidden").addClass("active fade").fadeIn();
  });

  $(".edit-address-back-button").on("click.jagannathapuri", function () {
    $(".menu-tab-pane").removeClass("active fade").addClass("hidden");
    $("#address").removeClass("hidden").addClass("active fade").fadeIn();
  });

  $(".logout-button").on("click.jagannathapuri", function (e) {
    e.preventDefault();
    isAnythingOpen();
    showSidebar(".logout-modal");
  });

  /*------ Banner with Filter Button  ------*/
  $(".filter-button").on("click.jagannathapuri", function () {
    const parent = $(this).closest(".filter-dropdown");
    const menu = parent.find(".filter-dropdown-menu");
    const icon = parent.find(".filter-dropdown-icon");

    const isOpen = $(this).attr("data-state") === "open";

    $(".filter-button").attr("data-state", "close");
    $(".filter-button").removeClass(
      "ring-primary text-primary transition-colors duration-300 ease-in-out"
    );
    $(".filter-button span i").removeClass(
      "text-primary transition-colors duration-300 ease-in-out"
    );
    $(".filter-dropdown-menu").removeClass("active").addClass("hide");
    $(".filter-dropdown-icon").removeClass(
      "rotate-180 text-primary transition-colors duration-300 ease-in-out"
    );

    if (!isOpen) {
      $(this).attr("data-state", "open");
      $(this).addClass(
        "ring-primary text-primary transition-colors duration-300 ease-in-out"
      );
      $(this)
        .find("span i")
        .addClass("text-primary transition-colors duration-300 ease-in-out");
      menu.removeClass("hide").addClass("active");
      icon.addClass(
        "rotate-180 text-primary transition-colors duration-300 ease-in-out"
      );

      const rect = parent[0].getBoundingClientRect();
      const windowWidth = window.innerWidth;

      menu.removeClass("left-0 right-0 left-auto right-auto");

      if (rect.left + rect.width / 2 > windowWidth / 2) {
        menu.addClass("right-0 left-auto");
      } else {
        menu.addClass("left-0 right-auto");
      }
    }
  });

  /*------ Filter Sidebar ----*/
  const filterSidebarMenu = $("#filter-menu-btn");
  const filterSidebar = $("#filter-sidebar");
  const filterSidebarMenuClose = $("#filter-side-bar-menu-close");

  if (filterSidebarMenu.length) {
    filterSidebarMenu.on("click.jagannathapuri", function () {
      $(filterSidebar).attr("data-state", "open");
      $body.addClass("overflow-hidden");
    });
  }

  if (filterSidebarMenuClose.length) {
    filterSidebarMenuClose.on("click.jagannathapuri", function () {
      $(filterSidebar).attr("data-state", "close");
      $body.removeClass("overflow-hidden");
    });
  }
  const filterPriceRangeSlider = document.getElementById(
    "filter-price-range-slider"
  );
  if (filterPriceRangeSlider) {
    safeInit(function () {
      if (typeof noUiSlider === "undefined") return;

      noUiSlider.create(filterPriceRangeSlider, {
        start: [0, 100],
        connect: true,
        range: {
          min: 0,
          max: 100,
        },
        format: {
          to: (value) => value,
          from: (value) => value,
        },
      });

      filterPriceRangeSlider.noUiSlider.on("update", (values) => {
        $(".filter-price-range-min-value").val(Number(values[0]).toFixed(0));
        $(".filter-price-range-max-value").val(Number(values[1]).toFixed(0));
      });

      addCleanup(function () {
        try {
          if (filterPriceRangeSlider.noUiSlider) {
            filterPriceRangeSlider.noUiSlider.destroy();
          }
        } catch (e) { }
      });
    });
  }



  /*------ Radial Bar Chart ------*/
  const radialBarChart = $("#radial-bar-chart");
  if (radialBarChart.length) {
    const radialBarChartOptions = {
      series: [30, 20, 70, 50],
      chart: {
        width: 250,
        type: "donut",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#5ed9ba", "#056d6e", "#04535c", "#088178"],
      labels: [
        "Recent Orders",
        "Pending Payments",
        "Received Payments",
        "Complete Order",
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              show: false,
            },
          },
        },
      ],
      legend: {
        show: false,
      },
    };

    safeInit(function () {
      if (typeof ApexCharts === "undefined") return;
      new ApexCharts(
        document.querySelector("#radial-bar-chart"),
        radialBarChartOptions
      ).render();
    });
  }

  /*------ Price Movement Chart ------*/
  const priceMovementChart = $("#price-movement-chart");
  if (priceMovementChart.length) {
    const priceMovementChartOptions = {
      series: [
        {
          name: "Asia",
          data: [85, 32, 67, 120, 45, 98, 23, 140, 75, 110, 55, 135],
        },
        {
          name: "America",
          data: [20, 51, 35, 51, 49, 62, 69, 91, 148, 100, 120, 150],
        },
      ],
      colors: ["#088178", "#FFE700"],
      chart: {
        height: 340,
        type: "line",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
        width: 2,
      },
      title: {
        show: false,
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        strokeColor: "#919EAB3D",
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: "400",
            color: "#919EAB",
            fontFamily: "var(--font-dm-sans)",
          },
        },
      },
      xaxis: {
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: "400",
            color: "#919EAB",
            fontFamily: "var(--font-dm-sans)",
          },
        },
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      legend: {
        show: false,
      },
    };

    safeInit(function () {
      if (typeof ApexCharts === "undefined") return;
      new ApexCharts(
        document.querySelector("#price-movement-chart"),
        priceMovementChartOptions
      ).render();
    });
  }

  /*------ Common Slider ----*/
  safeInit(function () {
    if ($.fn && $.fn.slick) {
      $(".jagannathapuri-slider").slick({
        prevArrow:
          '<span class="slider-btn slider-prev size-12 rounded-full inline-flex items-center justify-center transition-colors duration-300 group/slider-btn cursor-pointer"><i class="hgi hgi-stroke hgi-arrow-left-01 text-[22px] text-light-primary-text transition-colors duration-300"></i></span>',
        nextArrow:
          '<span class="slider-btn slider-next size-12 rounded-full inline-flex items-center justify-center transition-colors duration-300 group/slider-btn cursor-pointer"><i class="hgi hgi-stroke hgi-arrow-right-01 text-[22px] text-light-primary-text transition-colors duration-300"></i></span>',
      });

      addCleanup(function () {
        try {
          const $slider = $(".jagannathapuri-slider");
          if ($slider.hasClass("slick-initialized")) $slider.slick("unslick");
        } catch (e) { }
      });
    }
  });

  /*------ Scroll To Top Button ----*/
  const $scrollToTop = $(".scroll-to-top");
  $win.on("scroll.jagannathapuri", function () {
    if ($win.scrollTop() > 300) {
      $scrollToTop.removeClass("hide").addClass("active");
    } else {
      $scrollToTop.removeClass("active").addClass("hide");
    }
  });

  $scrollToTop.on("click.jagannathapuri", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return false;
  });

  /*------ Add to Cart AJAX ------*/
  const updateCartUI = (cart) => {
    const $cartCount = $("#cart-count");
    const $sidebarHeaderCount = $(".cart-sidebar-header p");
    const $cartList = $(".cart-products-content");
    const $subtotalDisplay = $(".cart-subtotal h5:last-child");

    $cartCount.text(cart.length);
    if ($sidebarHeaderCount.length) {
      $sidebarHeaderCount.text(`${cart.length} Item${cart.length !== 1 ? 's' : ''} in Cart`);
    }

    if (cart.length === 0) {
      $cartList.html('<p class="text-center py-8 text-light-secondary-text">Your cart is empty.</p>');
      $subtotalDisplay.text("₹0.00");
    } else {
      let subtotal = 0;
      $cartList.empty();

      cart.forEach((item) => {
        subtotal += item.price * item.quantity;
        $cartList.append(`
          <div class="cart-product-item flex flex-col sm:flex-row items-center sm:gap-x-4 gap-y-2 sm:gap-y-0 p-4 border border-gray-300 rounded-2xl">
            <a class='cart-product-item-image sm:w-[102px] sm:h-[102px] rounded-xl bg-[#F4F3F5] overflow-hidden relative' href='/product/${item.slug}'>
              <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-xl" />
            </a>
            <div class="cart-product-item-content flex flex-col gap-y-2 flex-1 w-full">
              <div class="flex items-center justify-between gap-x-2">
                <h6 class="text-base font-semibold">
                  <a href='/product/${item.slug}'>${item.name}</a>
                </h6>
                <div class="flex items-center gap-x-2">
                  <button class="hgi hgi-stroke hgi-edit-circle text-2xl leading-6 text-light-primary-text"></button>
                  <button class="remove-cart-item hgi hgi-stroke hgi-delete-01 text-xl text-light-primary-text" data-product-id="${item.productId}"></button>
                </div>
              </div>
              <p class="text-sm leading-[22px] text-light-secondary-text">Color: Default, Size: Standard</p>
              <div class="flex items-center justify-between gap-x-2">
                <h6 class="text-base font-bold text-light-primary-text">₹${parseFloat(item.price).toFixed(2)}</h6>
                <div class="border border-gray-300 inline-flex items-center rounded-[80px] max-w-[102px] p-1">
                  <button class="cart-qty-minus-btn inline-flex items-center justify-center size-7 rounded-full hover:bg-[rgba(145,158,171,0.08)]" data-product-id="${item.productId}">
                    <i class="hgi hgi-stroke hgi-remove-circle text-2xl leading-6"></i>
                  </button>
                  <input type="text" class="w-full text-center outline-none bg-transparent text-sm font-semibold" value="${item.quantity}" readonly>
                  <button class="cart-qty-plus-btn inline-flex items-center justify-center size-7 rounded-full hover:bg-[rgba(145,158,171,0.08)]" data-product-id="${item.productId}">
                    <i class="hgi hgi-stroke hgi-add-circle text-2xl leading-6"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `);
      });
      if ($subtotalDisplay.length) {
        $subtotalDisplay.text(`₹${subtotal.toFixed(2)}`);
      } else {
        $(".cart-subtotal-amount").text(`₹${subtotal.toFixed(2)}`);
      }
    }

    // Always fetch similar products to keep recommendations fresh
    updateSimilarProducts();
  };

  const updateSimilarProducts = () => {
    const $similarContainer = $(".similar-products-content");

    $.get("/cart/similar", function (response) {
      if (response.success && response.products.length > 0) {
        $similarContainer.empty();
        response.products.forEach(product => {
          let image = '/assets/images/logo.png';
          if (product.images && product.images.length > 0) {
            const img = product.images[0].trim();
            image = (img.startsWith('http') || img.startsWith('/')) ? img : '/uploads/' + img;
          }

          $similarContainer.append(`
            <div class="similar-product-item flex items-center gap-x-4 p-4 border border-gray-300 rounded-2xl">
              <a class='similar-product-item-image w-[102px] h-[102px] rounded-xl bg-[#F4F3F5] overflow-hidden relative' href='/product/${product.slug}'>
                <img src="${image}" alt="${product.product_name}" class="w-full h-full object-cover rounded-xl" />
                ${product.discount_percent > 0 ? `<span class="product-discount-badge absolute top-[11px] left-0 bg-error text-warning-lighter font-medium text-sm leading-[22px] px-1 uppercase">${product.discount_percent}% OFF</span>` : ''}
              </a>
              <div class="similar-product-item-content flex flex-col gap-y-2 flex-1">
                <h6 class="text-base font-semibold">
                  <a href='/product/${product.slug}'>${product.product_name}</a>
                </h6>
                <p class="text-sm leading-[22px] text-light-secondary-text">Contextual Recommendation</p>
                <div class="flex items-center justify-between">
                  <div class="price-section flex items-center gap-x-3">
                    <span class="current-price text-base font-semibold text-light-primary-text">₹${parseFloat(product.price_amount).toFixed(2)}</span>
                    ${product.old_price ? `<span class="old-price text-base text-light-disabled-text line-through">₹${parseFloat(product.old_price).toFixed(2)}</span>` : ''}
                  </div>
                  <button class="btn btn-primary btn-medium rounded-full font-semibold text-sm leading-6 px-4 py-2 add-to-cart-btn" data-product-id="${product.id}">
                    <span>
                      <i class="hgi hgi-stroke hgi-shopping-cart-02 text-xl text-white"></i>
                    </span>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          `);
        });
      } else {
        $similarContainer.html('<p class="text-center py-4 text-light-secondary-text">No recommendations available.</p>');
      }
    });
  };

  // Optimistic UI Helpers
  const updateCartSubtotalOptimistic = () => {
    let subtotal = 0;
    let itemCount = 0;
    $(".cart-product-item").each(function () {
      const $row = $(this);
      const priceText = $row.find(".current-price").text().replace(/[^0-9.]/g, '');
      const price = parseFloat(priceText) || 0;
      const quantity = parseInt($row.find("input").val()) || 0;
      const rowTotal = price * quantity;
      subtotal += rowTotal;
      itemCount++;

      // Update Row Total (Cart Page)
      $row.find(".product-total-price p").text("₹" + rowTotal.toFixed(2));
    });

    // Update Sidebar Subtotal
    $(".cart-subtotal h5:last-child").text("₹" + subtotal.toFixed(2));

    // Update Cart Page Subtotal & Total
    $(".cart-subtotal p span").text("₹" + subtotal.toFixed(2));
    $(".cart-total span").text("₹" + subtotal.toFixed(2));

    // Handle empty state if no items
    if (itemCount === 0) {
      $(".cart-products-content").html('<p class="text-center text-gray-500">Your cart is empty.</p>');
      $(".cart-subtotal h5:last-child").text("₹0.00");

      // Cart page empty state
      $("tbody").html('<tr><td colspan="5" class="py-8 text-center text-gray-500">Your cart is empty.</td></tr>');
      $(".cart-subtotal p span").text("₹0.00");
      $(".cart-total span").text("₹0.00");
    }
  };

  const updateCartCountOptimistic = (change) => {
    const $cartCount = $("#cart-count");
    const $sidebarHeaderCount = $(".cart-products-header p");

    let currentCount = parseInt($cartCount.text()) || 0;
    let newCount = currentCount + change;
    if (newCount < 0) newCount = 0;

    $cartCount.text(newCount);

    if ($sidebarHeaderCount.length) {
      $sidebarHeaderCount.text(`${newCount} Item${newCount !== 1 ? 's' : ''} in Cart`);
    }
  };

  const getSingleSkeletonHtml = (metadata = {}) => {
    return `
      <div class="cart-product-item flex flex-col sm:flex-row items-center sm:gap-x-4 gap-y-2 sm:gap-y-0 p-4 border border-gray-300 rounded-2xl opacity-60 animate-pulse">
        <div class="sm:w-[102px] sm:h-[102px] rounded-xl bg-gray-200 overflow-hidden relative">
          ${metadata.image ? `<img src="${metadata.image}" class="w-full h-full object-cover" />` : ''}
        </div>
        <div class="cart-product-item-content flex flex-col gap-y-2 flex-1 w-full">
          <div class="flex items-center justify-between gap-x-2">
            <h6 class="text-base font-semibold">${metadata.name || 'Loading...'}</h6>
            <div class="flex items-center gap-x-2">
              <div class="size-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <p class="text-xs text-gray-400">${metadata.processing ? 'Processing...' : 'Fetching details...'}</p>
          <div class="flex items-center justify-between gap-x-2">
            <h6 class="text-base font-bold text-light-primary-text">₹${parseFloat(metadata.price || 0).toFixed(2)}</h6>
            <div class="size-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    `;
  };

  const getCartSkeletonHtml = (count = 3) => {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += getSingleSkeletonHtml();
    }
    return html;
  };

  // Helper for updating quantity in cart
  const updateCartQuantity = (productId, quantity) => {
    $.ajax({
      url: "/cart/update",
      method: "POST",
      data: { productId, quantity },
      success: function (response) {
        if (response.success) {
          // Sync with server state eventually to ensure consistency
          updateCartUI(response.cart);
        }
      }
    });
  };

  $body.on("click", ".cart-qty-plus-btn", function (e) {
    e.preventDefault();
    const productId = $(this).data("product-id");
    const $input = $(this).siblings("input");
    const currentQty = parseInt($input.val());
    const newQty = currentQty + 1;

    // Optimistic Update
    $input.val(newQty);
    updateCartSubtotalOptimistic();

    updateCartQuantity(productId, newQty);
  });

  $body.on("click", ".cart-qty-minus-btn", function (e) {
    e.preventDefault();
    const productId = $(this).data("product-id");
    const $input = $(this).siblings("input");
    const currentQty = parseInt($input.val());
    if (currentQty > 1) {
      const newQty = currentQty - 1;

      // Optimistic Update
      $input.val(newQty);
      updateCartSubtotalOptimistic();

      updateCartQuantity(productId, newQty);
    }
  });

  const addToCart = (productId, quantity = 1, metadata = {}) => {
    // Optimistic Update: Open sidebar and increment count
    updateCartCountOptimistic(parseInt(quantity));
    showSidebar(".cart-sidebar");

    // Optimistic Item Rendering
    const $cartList = $(".cart-products-content");
    const skeletonId = `skeleton-${Date.now()}`;

    // Remove "Your cart is empty" message if it exists
    if ($cartList.find('.text-center').length) {
      $cartList.empty();
    }

    const $optimisticItem = $(getSingleSkeletonHtml({ ...metadata, processing: true }));
    $optimisticItem.attr('id', skeletonId);
    $cartList.prepend($optimisticItem);

    $.ajax({
      url: "/cart/add",
      method: "POST",
      data: { productId, quantity },
      success: function (response) {
        if (response.success) {
          updateCartUI(response.cart);
        } else {
          $(`#${skeletonId}`).remove();
          updateCartCountOptimistic(-parseInt(quantity));
          alert(response.message || "Failed to add to cart");
        }
      },
      error: function () {
        $(`#${skeletonId}`).remove();
        updateCartCountOptimistic(-parseInt(quantity));
        alert("Something went wrong. Please try again.");
      }
    });
  };

  $body.on("click", ".add-to-cart-btn", function (e) {
    e.preventDefault();
    const $btn = $(this);

    // 1. Try data attribute first (most direct)
    let productId = $btn.data("product-id");
    let quantity = 1;

    // Metadata extraction for optimistic UI
    let name = "";
    let price = 0;
    let image = "";

    // context finding
    const $card = $btn.closest(".product-card-1, .product-details-content, .similar-product-item");

    if ($card.length) {
      name = $card.find("h3, h5, h6").first().text().trim();
      price = $card.find(".current-price").first().text().replace(/[^0-9.]/g, '');
      image = $card.find("img").first().attr("src");
    }

    // 2. Fallback to closest form if data-product-id is missing
    if (!productId) {
      const $form = $btn.closest("form");
      if ($form.length) {
        productId = $form.find("input[name='productId']").val();
        quantity = $form.find("input[name='quantity']").val() || 1;
      }
    }

    // 3. Fallback to product details/quick view specific structures for quantity
    if (!productId) {
      // Last resort search
      productId = $btn.closest("[data-product-id]").data("product-id");
    }

    // Check for nearby quantity inputs (details)
    const $qtyInput = $btn.closest(".product-add-to-cart-btn-section, .product-details-content").find(".quantity-input");
    if ($qtyInput.length) {
      quantity = $qtyInput.val();
    }

    if (productId) {
      addToCart(productId, quantity, { name, price, image });
    } else {
      console.error("Add to Cart failed: Product ID not found", $btn[0]);
      alert("Error: Product ID missing for this button.");
    }
  });

  $body.on("click", ".buy-now-btn", function (e) {
    e.preventDefault();
    const $btn = $(this);

    let productId = $btn.data("product-id");
    let quantity = 1;

    // Look for form wrapper if id is missing
    if (!productId) {
      const $form = $btn.closest("form");
      if ($form.length) {
        productId = $form.find("input[name='productId']").val();
        quantity = $form.find("input[name='quantity']").val() || 1;
      }
    }

    // Fallback search
    if (!productId) {
      productId = $btn.closest("[data-product-id]").data("product-id");
    }

    // Capture quantity input if nearby
    const $qtyInput = $btn.closest("td, .product-add-to-cart-btn-section, .product-details-content").find(".quantity-input");
    if ($qtyInput.length) {
      quantity = $qtyInput.val() || 1;
    }

    if (!productId) {
      console.error("Buy Now failed: Product ID not found", $btn[0]);
      alert("Error: Product ID missing for this button.");
      return;
    }

    const originalText = $btn.html();
    $btn.prop('disabled', true).html('<i class="bx bx-loader-alt animate-spin mr-2"></i>Processing...');

    $.ajax({
      url: "/cart/add",
      method: "POST",
      data: { productId, quantity },
      success: function (response) {
        if (response.success) {
          window.location.href = '/checkout';
        } else {
          $btn.prop('disabled', false).html(originalText);
          alert(response.error || "Failed to process Buy Now.");
        }
      },
      error: function (xhr) {
        if (xhr.status === 401) {
          window.location.href = '/login?redirect=/checkout';
        } else {
          $btn.prop('disabled', false).html(originalText);
          alert("Something went wrong. Please try again.");
        }
      }
    });
  });

  // Load cart on page load to sync count
  const $initialCartList = $(".cart-products-content");
  if ($initialCartList.length && $initialCartList.is(':empty')) {
    $initialCartList.html(getCartSkeletonHtml(3));
  }

  $.get("/cart/api", function (cart) {
    updateCartUI(cart);
  });

  // Handle remove item from cart
  $body.on("click", ".remove-cart-item", function (e) {
    e.preventDefault();
    const productId = $(this).data("product-id");

    // Optimistic Update
    $(this).closest('.cart-product-item').remove();
    updateCartCountOptimistic(-1);
    updateCartSubtotalOptimistic();

    $.ajax({
      url: "/cart/remove",
      method: "POST",
      data: { productId },
      success: function (response) {
        if (response.success) {
          updateCartUI(response.cart);
        }
      }
    });
  });



  /*------ Logout Flow ----*/
  $body.on("click", ".logout-btn", function (e) {
    e.preventDefault();

    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your session!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#880000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Stay logged in',
      background: '#fff',
      borderRadius: '16px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
              "CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
          });
          const data = await response.json();
          if (data.success) {
            Swal.fire({
              title: 'Logged Out!',
              text: 'You have been successfully logged out.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              window.location.href = "/";
            });
          } else {
            Swal.fire('Error!', data.error || "Logout failed", 'error');
          }
        } catch (error) {
          console.error("Logout error:", error);
          Swal.fire('Error!', "Something went wrong. Please try again.", 'error');
        }
      }
    });
  });

  /*------ Login Form Submission ----*/
  $body.on("submit", "#loginForm", async function (e) {
    e.preventDefault();
    const $form = $(this);
    const $submitBtn = $form.find('button[type="submit"]');
    const originalBtnText = $submitBtn.text();

    const formData = {
      email: $form.find('input[name="email"]').val(),
      password: $form.find('input[name="password"]').val()
    };

    try {
      $submitBtn.prop('disabled', true).text('Signing In...');
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = "/user-account";
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      $submitBtn.prop('disabled', false).text(originalBtnText);
    }
  });

  /*------ Register Form Submission ----*/
  $body.on("submit", "#registerForm", async function (e) {
    e.preventDefault();
    const $form = $(this);
    const $submitBtn = $form.find('button[type="submit"]');
    const originalBtnText = $submitBtn.text();

    const password = $form.find('input[name="password"]').val();
    const confirmPassword = $form.find('input[name="confirmPassword"]').val();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const formData = {
      fullName: $form.find('input[name="firstName"]').val() + " " + $form.find('input[name="lastName"]').val(),
      email: $form.find('input[name="email"]').val(),
      password: password
    };

    try {
      $submitBtn.prop('disabled', true).text('Creating Account...');
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        if (data.requiresVerification) {
          alert(data.message || "Please check your email to verify your account.");
          // Optionally close the sidebar or reset the form
          $form[0].reset();
          isAnythingOpen();
          $('[data-state="open"]').attr('data-state', 'close');
          $body.removeClass("overflow-hidden");
          $modalOverlay.fadeOut();
        } else {
          window.location.href = "/user-account";
        }
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      $submitBtn.prop('disabled', false).text(originalBtnText);
    }
  });

  /*------ Forgot Password Form Submission ----*/
  $body.on("submit", "#forgotPasswordForm", async function (e) {
    e.preventDefault();
    const $form = $(this);
    const $submitBtn = $form.find('button[type="submit"]');
    const originalBtnText = $submitBtn.text();

    const formData = {
      email: $form.find('input[name="email"]').val()
    };

    try {
      $submitBtn.prop('disabled', true).text('Processing...');
      // Simulated or actual reset logic
      alert("Safe to reset! Check your email for instructions (Simulated)");
      isAnythingOpen();
      $(this).closest('[data-state="open"]').attr('data-state', 'close');
      $body.removeClass("overflow-hidden");
      $modalOverlay.fadeOut();
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      $submitBtn.prop('disabled', false).text(originalBtnText);
    }
  });

  /*------ Advanced Auth (Google & OTP) ----*/

  // Google Login
  $body.on("click", "#googleLoginBtn", async function (e) {
    e.preventDefault();
    try {
      const { data, error } = await window.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback' // Ensure this matches Supabase redirect URL
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google Login error:", error);
      alert("Google Login failed: " + error.message);
    }
  });

  // Switch between Password and OTP Login
  $body.on("click", "#switchToOtp", function (e) {
    e.preventDefault();
    $("#loginForm").addClass("hidden");
    $("#otpForm").removeClass("hidden");
  });

  $body.on("click", "#switchToPassword", function (e) {
    e.preventDefault();
    $("#otpForm").addClass("hidden");
    $("#loginForm").removeClass("hidden");
  });

  // Send OTP
  $body.on("click", "#sendOtpBtn", async function (e) {
    e.preventDefault();
    const email = $("#otp-email").val();
    if (!email) return alert("Please enter your email");

    const $btn = $(this);
    try {
      $btn.prop("disabled", true).text("Sending...");
      const response = await fetch("/send-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        $("#otpEmailStep").addClass("hidden");
        $("#otpVerifyStep").removeClass("hidden");
        alert(data.message);
      } else {
        alert(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      alert("Something went wrong");
    } finally {
      $btn.prop("disabled", false).text("Send OTP");
    }
  });

  // Verify OTP
  $body.on("submit", "#otpForm", async function (e) {
    e.preventDefault();
    const email = $("#otp-email").val();
    const token = $("#otp-token").val();

    if (!token) return alert("Please enter the OTP");

    const $submitBtn = $(this).find('button[type="submit"]');
    try {
      $submitBtn.prop("disabled", true).text("Verifying...");
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ email, token })
      });
      const data = await response.json();
      if (data.success) {
        window.location.href = "/user-account";
      } else {
        alert(data.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      alert("Something went wrong");
    } finally {
      $submitBtn.prop("disabled", false).text("Verify & Sign In");
    }
  });

  /*------ Checkout Form Submission (Moved to checkout.ejs for Razorpay integration) ----*/

  /*------ Live Product Search ------*/
  let searchTimeout = null;
  $body.on('input', '.header-search-input', function () {
    const $input = $(this);
    const query = $input.val().trim();
    const $container = $input.closest('.search-input-container').find('.search-result-container');

    clearTimeout(searchTimeout);

    if (query.length < 2) {
      $container.attr('data-state', 'close');
      return;
    }

    // Show loading state optionally
    $container.attr('data-state', 'open');
    if ($container.find('.search-loading').length === 0) {
      $container.html('<div class="flex justify-between items-center mb-4"><p class="font-semibold text-light-primary-text">Search Results</p></div><p class="text-sm text-gray-500 search-loading"><i class="bx bx-loader-alt animate-spin mr-1"></i> Searching...</p>');
    }

    searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success && data.products.length > 0) {
          let html = '<div class="flex justify-between items-center mb-4"><p class="font-semibold text-light-primary-text">Search Results</p></div>';
          html += '<div class="flex flex-col gap-y-4">';
          data.products.forEach(p => {
            let img = '/assets/images/logo.png';
            if (p.images && p.images.length > 0) {
              const dbImg = p.images[0].trim();
              img = (dbImg.startsWith('http') || dbImg.startsWith('/')) ? dbImg : '/uploads/' + dbImg;
            }
            html += `
              <a href="/product-details/${p.slug}" class="flex items-center gap-x-4 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <div class="size-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <img src="${img}" class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col flex-1 min-w-0">
                  <h6 class="text-sm font-semibold truncate text-light-primary-text mb-1">${p.product_name}</h6>
                  <div class="flex items-center gap-x-2">
                    <span class="text-primary text-sm font-bold leading-5">₹${p.sale_price || p.regular_price || p.price_amount}</span>
                    ${p.on_sale && p.regular_price ? `<span class="text-xs text-light-disabled-text line-through">₹${p.regular_price}</span>` : ''}
                  </div>
                </div>
              </a>
            `;
          });
          html += '</div>';

          $container.html(html);
        } else {
          $container.html('<div class="flex justify-between items-center mb-4"><p class="font-semibold text-light-primary-text">Search Results</p></div><p class="text-sm text-gray-500">No products found for "' + query + '"</p>');
        }
      } catch (err) {
        console.error('Search error:', err);
        $container.html('<div class="flex justify-between items-center mb-4"><p class="font-semibold text-light-primary-text">Search Results</p></div><p class="text-sm text-error">An error occurred.</p>');
      }
    }, 400);
  });

  // Handle enter key submit
  $body.on('keypress', '.header-search-input', function (e) {
    if (e.which == 13) {
      e.preventDefault();
      const q = $(this).val().trim();
      if (q.length > 0) window.location.href = '/shop?search=' + encodeURIComponent(q);
    }
  });

  // Close search when clicking outside
  $doc.on('click.jagannathapuri', function (e) {
    if (!$(e.target).closest('.search-input-container').length) {
      $('.search-result-container').attr('data-state', 'close');
    }
  });

  /*------ Wishlist Bulk Add To Cart Logic ----*/

  // Select All functionality
  $body.on('change', '#wishlist-select-all', function () {
    const isChecked = $(this).prop('checked');
    $('.wishlist-item-checkbox').prop('checked', isChecked);
    updateWishlistSelectedCount();
  });

  // Individual item selection functionality
  $body.on('change', '.wishlist-item-checkbox', function () {
    const totalCheckboxes = $('.wishlist-item-checkbox').length;
    const checkedCheckboxes = $('.wishlist-item-checkbox:checked').length;

    // Update Select All checkbox state
    if (totalCheckboxes > 0 && totalCheckboxes === checkedCheckboxes) {
      $('#wishlist-select-all').prop('checked', true);
    } else {
      $('#wishlist-select-all').prop('checked', false);
    }

    updateWishlistSelectedCount();
  });

  // Update selected count display
  function updateWishlistSelectedCount() {
    const count = $('.wishlist-item-checkbox:checked').length;
    const $counter = $('#wishlist-selected-count');
    if ($counter.length) {
      $counter.text(`${count} item${count !== 1 ? 's' : ''} selected`);
    }
  }

  // Handle Bulk Add to Cart button click
  $body.on('click', '#wishlist-bulk-add-btn', async function (e) {
    e.preventDefault();
    const $btn = $(this);
    const checkedItems = $('.wishlist-item-checkbox:checked');

    if (checkedItems.length === 0) {
      alert("Please select at least one item to add to your cart.");
      return;
    }

    const itemsToAdd = [];
    checkedItems.each(function () {
      itemsToAdd.push({
        productId: $(this).val(),
        quantity: 1 // Default quantity to 1 for bulk additions
      });
    });

    const originalHtml = $btn.html();
    $btn.html('<span class="inline-flex items-center justify-center"><i class="bx bx-loader-alt animate-spin text-2xl leading-6"></i></span> Adding...');
    $btn.prop('disabled', true);

    try {
      const response = await fetch("/cart/add-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ items: itemsToAdd })
      });

      const data = await response.json();
      if (data.success) {
        // Optimistically trigger cart UI refresh with new data
        updateCartUI(data.cart);

        // Uncheck all boxes
        $('.wishlist-item-checkbox').prop('checked', false);
        $('#wishlist-select-all').prop('checked', false);
        updateWishlistSelectedCount();

        // Show success animation or alert
        $btn.html('<span class="inline-flex items-center justify-center"><i class="hgi hgi-stroke hgi-tick-02 text-2xl leading-6"></i></span> Added!');
        setTimeout(() => {
          $btn.html(originalHtml);
          $btn.prop('disabled', false);

          // Optionally redirect user
          if (confirm("Cart updated successfully. Would you like to view your cart?")) {
            window.location.href = "/cart";
          }
        }, 1500);
      } else {
        alert(data.message || "Failed to add items to cart.");
        $btn.html(originalHtml);
        $btn.prop('disabled', false);
      }
    } catch (error) {
      console.error("Bulk add error:", error);
      alert("Something went wrong. Please try again.");
      $btn.html(originalHtml);
      $btn.prop('disabled', false);
    }
  });

  // Initialize count on page load
  $(document).ready(function () {
    if ($('#wishlist-selected-count').length) {
      updateWishlistSelectedCount();
    }
  });

  /*------ Cleanup (Memory Management) ----*/
  function destroy() {
    try {
      // Remove all namespaced event listeners
      $win.off(".jagannathapuri");
      $doc.off(".jagannathapuri");
      $body.off(".jagannathapuri");
      $("select").off(".jagannathapuri");
      $modalOverlay.off(".jagannathapuri");
      $scrollToTop.off(".jagannathapuri");

      // Run additional cleanup tasks (observers, sliders, plugins)
      cleanupTasks.forEach(function (task) {
        try {
          task();
        } catch (e) { }
      });
    } catch (e) { }
  }

  // Cleanup on page unload/navigation
  $win.on("unload.jagannathapuri", destroy);
})(jQuery);

