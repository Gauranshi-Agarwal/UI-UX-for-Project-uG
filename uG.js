/* =====================================================
   BOT AVATAR — EXACTLY ONE AVATAR PER BOT MESSAGE
   ===================================================== */

(function () {
  "use strict";

  const BOT_AVATAR_URL =
    "https://fpu.branding-element.com/prod/88870/ENGATI_PUBLIC/147645_15072026_073531_Screenshot_2026_07_15_at_1.01.59_PM.png-PSW2E.png";

  let processingScheduled = false;

  function isBotMessage(container) {
    if (!container) return false;

    return (
      container.getAttribute("data-msg-sender") === "bot" ||
      Boolean(
        container.querySelector(
          ".engt-msg-bot, .engt-msg-smo"
        )
      )
    );
  }

  function fixBotMessageAvatar(container) {
    if (!isBotMessage(container)) return;

    container.classList.add("upgrad-bot-message");

    /*
     * Remove duplicate custom avatars.
     * Only one custom avatar is allowed per message.
     */
    const customAvatars = Array.from(
      container.querySelectorAll(
        ":scope > .upgrad-bot-avatar"
      )
    );

    customAvatars.slice(1).forEach(function (avatar) {
      avatar.remove();
    });

    let avatar = customAvatars[0];

    if (!avatar) {
      avatar = document.createElement("div");
      avatar.className = "upgrad-bot-avatar";
      avatar.setAttribute("aria-hidden", "true");

      const image = document.createElement("img");
      image.className = "upgrad-bot-avatar-image";
      image.src = BOT_AVATAR_URL;
      image.alt = "";

      avatar.appendChild(image);

      /*
       * Always place the avatar as the first direct child,
       * so it remains beside the message.
       */
      container.insertBefore(
        avatar,
        container.firstChild
      );
    }

    const avatarImage = avatar.querySelector(
      ".upgrad-bot-avatar-image"
    );

    if (
      avatarImage &&
      avatarImage.getAttribute("src") !== BOT_AVATAR_URL
    ) {
      avatarImage.setAttribute("src", BOT_AVATAR_URL);
    }

    /*
     * Make sure the custom avatar remains first,
     * even when Engati updates the message.
     */
    if (container.firstElementChild !== avatar) {
      container.insertBefore(
        avatar,
        container.firstElementChild
      );
    }
  }

  function processAllBotMessages() {
    processingScheduled = false;

    document
      .querySelectorAll(".engt-msg-container")
      .forEach(fixBotMessageAvatar);
  }

  function scheduleProcessing() {
    if (processingScheduled) return;

    processingScheduled = true;

    window.requestAnimationFrame(
      processAllBotMessages
    );
  }

  const observer = new MutationObserver(function (mutations) {
    const containsMessageChanges = mutations.some(
      function (mutation) {
        return Array.from(mutation.addedNodes).some(
          function (node) {
            if (node.nodeType !== 1) return false;

            return (
              node.matches?.(".engt-msg-container") ||
              node.querySelector?.(".engt-msg-container") ||
              node.closest?.(".engt-msg-container")
            );
          }
        );
      }
    );

    if (containsMessageChanges) {
      scheduleProcessing();
    }
  });

  function initializeBotAvatars() {
    processAllBotMessages();

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeBotAvatars,
      { once: true }
    );
  } else {
    initializeBotAvatars();
  }
})();

/* ~ BOT AVATAR */

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

 

 

  /* =====================================================

     DESKTOP EXIT-INTENT CHAT OPEN

     Opens chatbot when the cursor leaves through the top

     ===================================================== */

 

  let exitIntentTriggered = false;

  let exitIntentCooldownTimer = 0;

 

  function enableExitIntentChat() {

    document.addEventListener("mouseout", function (event) {

      /* Desktop only: mobile devices do not have cursor exit intent. */

      if (

        window.matchMedia("(hover: none), (pointer: coarse)").matches

      ) {

        return;

      }

 

      /* Ignore movement between elements inside the webpage. */

      if (event.relatedTarget || event.toElement) {

        return;

      }

 

      /* Trigger only when the cursor exits through the top edge. */

      if (event.clientY > 5) {

        return;

      }

 

      if (isChatOpen() || exitIntentTriggered) {

        return;

      }

 

      exitIntentTriggered = true;

 

      window.clearTimeout(inactivityTimer);

      hideCallout();

      openChat();

 

      /* Permit another exit-intent trigger after 30 seconds. */

      window.clearTimeout(exitIntentCooldownTimer);

      exitIntentCooldownTimer = window.setTimeout(function () {

        exitIntentTriggered = false;

      }, 30000);

    });

  }

 

  createLauncher();

  addActivityListeners();

  enableExitIntentChat();

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
