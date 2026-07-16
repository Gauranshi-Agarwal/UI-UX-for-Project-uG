/* =====================================================
   BOT AVATAR CHANGE
   ===================================================== */

(function () {
  "use strict";

  /* Important: no space before https */
  const BOT_AVATAR_URL =
    "https://fpu.branding-element.com/prod/88870/ENGATI_PUBLIC/147645_15072026_073531_Screenshot_2026_07_15_at_1.01.59_PM.png-PSW2E.png";

  function isBotMessage(messageContainer) {
    if (!messageContainer) return false;

    return (
      messageContainer.getAttribute("data-msg-sender") === "bot" ||
      Boolean(messageContainer.querySelector(".engt-msg-bot"))
    );
  }

  function changeBotAvatar() {
    const messageContainers = document.querySelectorAll(
      ".engt-msg-container"
    );

    messageContainers.forEach(function (messageContainer) {
      if (!isBotMessage(messageContainer)) return;

      let avatarWrapper = messageContainer.querySelector(
        ".engt-avatar-wrapper"
      );

      if (!avatarWrapper) {
        avatarWrapper = document.createElement("div");
        avatarWrapper.className = "engt-avatar-wrapper";

        messageContainer.insertBefore(
          avatarWrapper,
          messageContainer.firstChild
        );
      }

      let avatarImage = avatarWrapper.querySelector(
        "img.engt-avatar-icon"
      );

      if (!avatarImage) {
        avatarImage = document.createElement("img");
        avatarImage.className = "engt-avatar-icon";
        avatarImage.alt = "upGrad Assistant";

        avatarWrapper.appendChild(avatarImage);
      }

      /*
       * Compare the original attribute rather than avatarImage.src,
       * because the browser converts src into an absolute URL.
       */
      if (
        avatarImage.getAttribute("src") !== BOT_AVATAR_URL
      ) {
        avatarImage.setAttribute("src", BOT_AVATAR_URL);
      }
    });
  }

  const avatarObserver = new MutationObserver(function (
    mutations
  ) {
    const containsNewMessage = mutations.some(function (
      mutation
    ) {
      return Array.from(mutation.addedNodes).some(function (
        node
      ) {
        return (
          node.nodeType === 1 &&
          (
            node.matches?.(".engt-msg-container") ||
            node.querySelector?.(".engt-msg-container")
          )
        );
      });
    });

    if (containsNewMessage) {
      changeBotAvatar();
    }
  });

  avatarObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  changeBotAvatar();
})();

/* ~ BOT AVATAR CHANGE */


/* =====================================================
   UPGRAD LAUNCHER, CALLOUT AND INACTIVITY OPENING
   ===================================================== */

(function () {
  "use strict";

  const CONFIG = {
    launcherImageUrl:
      "https://fpu.branding-element.com/prod/88870/INLINE_IMAGE/147645_15072026_073714_Screenshot_2026_07_15_at_1.07.03_PM.png-0atgo.png",

    calloutHeading: "Chat with us.",
    calloutText: "Get Instant Help!",

    /* Show callout after 2 seconds */
    calloutDelayMs: 2000,

    /* First automatic opening after 30 seconds */
    firstAutoOpenDelayMs: 30000,

    /* Reopen after 20 seconds following a user close */
    reopenAfterCloseDelayMs: 20000
  };

  let calloutTimer = 0;
  let inactivityTimer = 0;
  let mouseMoveTimer = 0;

  let userClosedChat = false;
  let lastActivityTime = Date.now();
  let activityListenersAdded = false;

  function getNativeLauncher() {
    return (
      document.getElementById("engtLauncherIcon") ||
      document.querySelector(".engt-launcher-icon")
    );
  }

  function getLauncherContainer() {
    return document.querySelector(
      ".engt-launch-icon-box"
    );
  }

  function getPopup() {
    return (
      document.getElementById("engt-popup") ||
      document.querySelector(".engt-popup") ||
      document.querySelector(".engt-chat-window") ||
      document.querySelector(".engt-chat-screen")
    );
  }

  function isElementVisible(element) {
    if (!element || !element.isConnected) {
      return false;
    }

    const style = window.getComputedStyle(element);
    const rectangle =
      element.getBoundingClientRect();

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity || 1) > 0 &&
      rectangle.width > 0 &&
      rectangle.height > 0
    );
  }

  function isChatOpen() {
    const popup = getPopup();

    if (!popup) {
      return false;
    }

    /*
     * Check common Engati closed states first.
     */
    if (
      popup.classList.contains("engt-hide") ||
      popup.classList.contains("hide") ||
      popup.classList.contains("closed") ||
      popup.getAttribute("aria-hidden") === "true"
    ) {
      return false;
    }

    return isElementVisible(popup);
  }

  function getCallout() {
    return document.querySelector(
      ".upgrad-launcher-callout"
    );
  }

  function hideCallout() {
    const callout = getCallout();

    if (callout) {
      callout.classList.remove("is-visible");
      callout.setAttribute("aria-hidden", "true");
    }
  }

  function showCallout() {
    if (isChatOpen()) return;

    const callout = getCallout();

    if (callout) {
      callout.classList.add("is-visible");
      callout.setAttribute("aria-hidden", "false");
    }
  }

  function updateLauncherVisibility() {
    const launcherContainer =
      getLauncherContainer();

    if (!launcherContainer) return;

    const chatOpen = isChatOpen();

    launcherContainer.classList.toggle(
      "upgrad-chat-open",
      chatOpen
    );

    if (chatOpen) {
      hideCallout();
    }
  }

  function triggerNativeLauncher() {
    const nativeLauncher = getNativeLauncher();

    if (!nativeLauncher) {
      console.warn(
        "Engati native launcher was not found."
      );
      return false;
    }

    /*
     * Use click() first because Engati may attach a native
     * click handler directly to the launcher.
     */
    if (typeof nativeLauncher.click === "function") {
      nativeLauncher.click();
    } else {
      nativeLauncher.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
    }

    return true;
  }

  function openChat() {
    if (isChatOpen()) {
      updateLauncherVisibility();
      return;
    }

    hideCallout();

    if (!triggerNativeLauncher()) {
      return;
    }

    userClosedChat = false;

    window.clearTimeout(inactivityTimer);

    /*
     * Engati may animate before the window becomes visible.
     */
    window.setTimeout(
      updateLauncherVisibility,
      100
    );

    window.setTimeout(
      updateLauncherVisibility,
      400
    );

    window.setTimeout(
      updateLauncherVisibility,
      900
    );
  }

  function createLauncher() {
    const launcherContainer =
      getLauncherContainer();

    const nativeLauncher =
      getNativeLauncher();

    if (!launcherContainer || !nativeLauncher) {
      return;
    }

    nativeLauncher.classList.add(
      "upgrad-native-launcher-hidden"
    );

    let customButton =
      launcherContainer.querySelector(
        ".upgrad-launcher-button"
      );

    if (!customButton) {
      customButton =
        document.createElement("button");

      customButton.type = "button";
      customButton.className =
        "upgrad-launcher-button";

      customButton.setAttribute(
        "aria-label",
        "Open upGrad chat"
      );

      customButton.setAttribute(
        "title",
        "Chat with upGrad"
      );

      const image =
        document.createElement("img");

      image.className =
        "upgrad-launcher-image";

      image.src =
        CONFIG.launcherImageUrl;

      image.alt = "upGrad chat";

      customButton.appendChild(image);

      customButton.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          event.stopPropagation();

          openChat();
        }
      );

      launcherContainer.appendChild(
        customButton
      );
    }

    let callout =
      launcherContainer.querySelector(
        ".upgrad-launcher-callout"
      );

    if (!callout) {
      callout =
        document.createElement("div");

      callout.className =
        "upgrad-launcher-callout";

      callout.setAttribute(
        "aria-hidden",
        "true"
      );

      const heading =
        document.createElement("span");

      heading.className =
        "upgrad-callout-heading";

      heading.textContent =
        CONFIG.calloutHeading;

      const text =
        document.createElement("span");

      text.className =
        "upgrad-callout-text";

      text.textContent =
        CONFIG.calloutText;

      callout.appendChild(heading);
      callout.appendChild(text);

      launcherContainer.insertBefore(
        callout,
        customButton
      );
    }

    updateLauncherVisibility();

    if (!calloutTimer) {
      calloutTimer = window.setTimeout(
        function () {
          calloutTimer = 0;

          if (!isChatOpen()) {
            showCallout();
          }
        },
        CONFIG.calloutDelayMs
      );
    }
  }

  function getCurrentInactivityDelay() {
    return userClosedChat
      ? CONFIG.reopenAfterCloseDelayMs
      : CONFIG.firstAutoOpenDelayMs;
  }

  function startInactivityTimer() {
    window.clearTimeout(inactivityTimer);

    if (isChatOpen()) {
      return;
    }

    const delay =
      getCurrentInactivityDelay();

    const remainingTime = Math.max(
      0,
      delay -
        (Date.now() - lastActivityTime)
    );

    inactivityTimer = window.setTimeout(
      function checkInactivity() {
        const inactiveFor =
          Date.now() - lastActivityTime;

        if (
          !isChatOpen() &&
          inactiveFor >= delay
        ) {
          openChat();
          return;
        }

        if (!isChatOpen()) {
          startInactivityTimer();
        }
      },
      remainingTime
    );
  }

  function eventOccurredInsideChat(event) {
    const target = event.target;

    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      target.closest(
        "#engtWrapper, " +
          "#engt-popup, " +
          ".engt-chat-screen, " +
          ".engt-chat-window, " +
          ".engt-launch-icon-box"
      )
    );
  }

  function registerWebsiteActivity(event) {
    if (eventOccurredInsideChat(event)) {
      return;
    }

    lastActivityTime = Date.now();

    if (!isChatOpen()) {
      startInactivityTimer();
    }
  }

  function addActivityListeners() {
    if (activityListenersAdded) return;

    ["click", "keydown", "touchstart", "scroll"].forEach(
      function (eventName) {
        document.addEventListener(
          eventName,
          registerWebsiteActivity,
          {
            passive: true
          }
        );
      }
    );

    document.addEventListener(
      "mousemove",
      function (event) {
        window.clearTimeout(mouseMoveTimer);

        mouseMoveTimer =
          window.setTimeout(function () {
            registerWebsiteActivity(event);
          }, 300);
      },
      {
        passive: true
      }
    );

    activityListenersAdded = true;
  }

  function isCloseButton(target) {
    if (!(target instanceof Element)) {
      return null;
    }

    return target.closest(
      "#engtClose, " +
        ".engt-close, " +
        ".engt-close-button, " +
        "[aria-label='Close'], " +
        "[aria-label='Minimize'], " +
        "[title='Close'], " +
        "[title='Minimize']"
    );
  }

  document.addEventListener(
    "click",
    function (event) {
      const closeButton =
        isCloseButton(event.target);

      if (!closeButton) return;

      userClosedChat = true;
      lastActivityTime = Date.now();

      window.clearTimeout(
        inactivityTimer
      );

      /*
       * Allow Engati's own closing animation to finish.
       */
      window.setTimeout(function () {
        updateLauncherVisibility();
        showCallout();
        startInactivityTimer();
      }, 600);
    },
    true
  );

  /*
   * Observe newly created Engati elements only.
   * Do not observe every class change, because our own class
   * updates would repeatedly trigger the observer.
   */
  const launcherObserver =
    new MutationObserver(function (
      mutations
    ) {
      const hasRelevantNewNode =
        mutations.some(function (mutation) {
          return Array.from(
            mutation.addedNodes
          ).some(function (node) {
            if (node.nodeType !== 1) {
              return false;
            }

            return (
              node.matches?.(
                ".engt-launch-icon-box, " +
                  "#engtLauncherIcon, " +
                  ".engt-launcher-icon, " +
                  "#engt-popup, " +
                  ".engt-chat-screen"
              ) ||
              node.querySelector?.(
                ".engt-launch-icon-box, " +
                  "#engtLauncherIcon, " +
                  ".engt-launcher-icon, " +
                  "#engt-popup, " +
                  ".engt-chat-screen"
              )
            );
          });
        });

      if (hasRelevantNewNode) {
        createLauncher();

        window.setTimeout(
          updateLauncherVisibility,
          50
        );
      }
    });

  launcherObserver.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  createLauncher();
  addActivityListeners();
  startInactivityTimer();

  /*
   * Lightweight fallback for Engati display changes.
   */
  window.setInterval(
    updateLauncherVisibility,
    750
  );
})();

/* ~ UPGRAD LAUNCHER, CALLOUT AND INACTIVITY OPENING */
/* =====================================================
   UPGRAD SMO - EXACT LAYOUT TRANSFORMATION
   ===================================================== */

(function () {
  "use strict";

  const ICONS = {
    programs: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"></path>
        <path d="M6 10.2v4.4c0 1.8 2.7 3.4 6 3.4s6-1.6 6-3.4v-4.4"></path>
        <path d="M21 9v4"></path>
      </svg>
    `,
    eligibility: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 20 6v6c0 4.7-3.2 7.7-8 9-4.8-1.3-8-4.3-8-9V6l8-3Z"></path>
        <path d="m8.5 12 2.2 2.2 4.8-5"></path>
      </svg>
    `,
    expert: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="7" r="3.5"></circle>
        <path d="M5 20v-2.5c0-3.2 2.8-5.5 7-5.5s7 2.3 7 5.5V20"></path>
      </svg>
    `,
    ai: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m8 3 1.2 3.2L12 7.5 9.2 8.8 8 12 6.8 8.8 4 7.5l2.8-1.3L8 3Z"></path>
        <path d="m17 11 1.1 2.9L21 15l-2.9 1.1L17 19l-1.1-2.9L13 15l2.9-1.1L17 11Z"></path>
        <path d="m5 15 .7 1.8L7.5 17.5l-1.8.7L5 20l-.7-1.8-1.8-.7 1.8-.7L5 15Z"></path>
      </svg>
    `
  };

  const BUTTON_MAP = [
    {
      matches: ["explore programs", "programs", "most in demand programs"],
      label: "Most in Demand\nPrograms",
      icon: "programs"
    },
    {
      matches: ["check eligibility", "eligibility", "eligibility check"],
      label: "Eligibility Check",
      icon: "eligibility"
    },
    {
      matches: [
        "speak to a counselor",
        "speak to a counsellor",
        "speak with an expert",
        "speak to an expert",
        "counselor",
        "counsellor"
      ],
      label: "Speak with an Expert",
      icon: "expert"
    },
    {
      matches: [
        "i couldn’t find what i’m looking for",
        "i couldn't find what i'm looking for",
        "ai assistance",
        "something else",
        "other"
      ],
      label: "AI Assistance",
      icon: "ai"
    }
  ];

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getMappedConfig(text) {
    const normalized = normalizeText(text);

    const found = BUTTON_MAP.find(function (item) {
      return item.matches.some(function (match) {
        return normalized.includes(match);
      });
    });

    return found || {
      label: String(text || "").trim(),
      icon: "programs"
    };
  }

  function getPromptText(smoMessage) {
    const textNode =
      smoMessage.querySelector(":scope > .engt-msg-text") ||
      smoMessage.querySelector(".engt-msg-text");

    return textNode ? textNode.innerText.trim() : "";
  }

  function getButtons(smoMessage) {
    return Array.from(
      smoMessage.querySelectorAll("button, .engt-button, .engt-button-base")
    ).filter(function (button) {
      return !button.classList.contains("upgrad-smo-button");
    });
  }

  function buildCustomButton(originalButton) {
    const originalText =
      originalButton.innerText ||
      originalButton.textContent ||
      "";

    const config = getMappedConfig(originalText);

    const newButton = document.createElement("button");
    newButton.type = "button";
    newButton.className = "upgrad-smo-button";

    const icon = document.createElement("span");
    icon.className = "upgrad-smo-icon";
    icon.innerHTML = ICONS[config.icon] || ICONS.programs;

    const label = document.createElement("span");
    label.className = "upgrad-smo-label";
    label.innerHTML = config.label.replace(/\n/g, "<br>");

    newButton.appendChild(icon);
    newButton.appendChild(label);

    newButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (typeof originalButton.click === "function") {
        originalButton.click();
      } else {
        originalButton.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );
      }
    });

    return newButton;
  }

  function transformSmoMessage(smoMessage) {
    if (!smoMessage || smoMessage.dataset.upgradSmoDone === "true") {
      return;
    }

    const buttons = getButtons(smoMessage);
    if (!buttons.length) return;

    const promptText = getPromptText(smoMessage);
    if (!promptText) return;

    const messageContainer = smoMessage.closest(".engt-msg-container");
    if (messageContainer) {
      messageContainer.classList.add("upgrad-smo-host");
    }

    const shell = document.createElement("div");
    shell.className = "upgrad-smo-shell";

    const prompt = document.createElement("div");
    prompt.className = "upgrad-smo-prompt";
    prompt.textContent = promptText;

    const grid = document.createElement("div");
    grid.className = "upgrad-smo-grid";

    buttons.forEach(function (button) {
      const customButton = buildCustomButton(button);
      grid.appendChild(customButton);
    });

    shell.appendChild(prompt);
    shell.appendChild(grid);

    /*
     * Hide original buttons but keep them in DOM for click actions.
     */
    const hiddenButtonsHolder = document.createElement("div");
    hiddenButtonsHolder.style.display = "none";

    buttons.forEach(function (button) {
      hiddenButtonsHolder.appendChild(button);
    });

    smoMessage.innerHTML = "";
    smoMessage.appendChild(shell);
    smoMessage.appendChild(hiddenButtonsHolder);

    smoMessage.classList.add("upgrad-smo-processed");
    smoMessage.dataset.upgradSmoDone = "true";
  }

  function processAllSmo() {
    const smoMessages = document.querySelectorAll(".engt-msg-smo");
    smoMessages.forEach(transformSmoMessage);
  }

  const observer = new MutationObserver(function (mutations) {
    const foundRelevant = mutations.some(function (mutation) {
      return Array.from(mutation.addedNodes).some(function (node) {
        if (node.nodeType !== 1) return false;

        return (
          node.matches?.(".engt-msg-smo") ||
          node.querySelector?.(".engt-msg-smo")
        );
      });
    });

    if (foundRelevant) {
      processAllSmo();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  processAllSmo();
})();

/* ~ UPGRAD SMO - EXACT LAYOUT TRANSFORMATION */
