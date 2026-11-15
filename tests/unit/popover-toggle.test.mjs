import test from "node:test";
import assert from "node:assert/strict";

test("Popover Toggle & Mutual Exclusivity Controller", async (t) => {
  // Simulate DOM elements for the 3 popovers and 3 buttons
  const mockQualityMenu = { style: { display: "none" } };
  const mockShortcutsDialog = { style: { display: "none" } };
  const mockPrefsDialog = { style: { display: "none" } };

  const mockBtnQuality = {
    classes: new Set(),
    attributes: {},
    classList: {
      add: (c) => mockBtnQuality.classes.add(c),
      remove: (c) => mockBtnQuality.classes.delete(c),
      contains: (c) => mockBtnQuality.classes.has(c),
    },
    setAttribute: (k, v) => { mockBtnQuality.attributes[k] = v; },
  };

  const mockBtnShortcuts = {
    classes: new Set(),
    attributes: {},
    classList: {
      add: (c) => mockBtnShortcuts.classes.add(c),
      remove: (c) => mockBtnShortcuts.classes.delete(c),
      contains: (c) => mockBtnShortcuts.classes.has(c),
    },
    setAttribute: (k, v) => { mockBtnShortcuts.attributes[k] = v; },
  };

  const mockBtnPrefs = {
    classes: new Set(),
    attributes: {},
    classList: {
      add: (c) => mockBtnPrefs.classes.add(c),
      remove: (c) => mockBtnPrefs.classes.delete(c),
      contains: (c) => mockBtnPrefs.classes.has(c),
    },
    setAttribute: (k, v) => { mockBtnPrefs.attributes[k] = v; },
  };

  let activePopover = null;

  const closeAllPopovers = () => {
    mockQualityMenu.style.display = "none";
    mockShortcutsDialog.style.display = "none";
    mockPrefsDialog.style.display = "none";

    mockBtnQuality.classList.remove("is-active");
    mockBtnQuality.setAttribute("aria-expanded", "false");

    mockBtnShortcuts.classList.remove("is-active");
    mockBtnShortcuts.setAttribute("aria-expanded", "false");

    mockBtnPrefs.classList.remove("is-active");
    mockBtnPrefs.setAttribute("aria-expanded", "false");

    activePopover = null;
  };

  const openPopover = (which) => {
    closeAllPopovers();

    if (which === "quality") {
      activePopover = "quality";
      mockQualityMenu.style.display = "flex";
      mockBtnQuality.classList.add("is-active");
      mockBtnQuality.setAttribute("aria-expanded", "true");
    } else if (which === "shortcuts") {
      activePopover = "shortcuts";
      mockShortcutsDialog.style.display = "flex";
      mockBtnShortcuts.classList.add("is-active");
      mockBtnShortcuts.setAttribute("aria-expanded", "true");
    } else if (which === "prefs") {
      activePopover = "prefs";
      mockPrefsDialog.style.display = "flex";
      mockBtnPrefs.classList.add("is-active");
      mockBtnPrefs.setAttribute("aria-expanded", "true");
    }
  };

  const togglePopover = (which) => {
    if (activePopover === which) {
      closeAllPopovers();
    } else {
      openPopover(which);
    }
  };

  await t.test("1st click opens Quality, 2nd click closes Quality", () => {
    assert.equal(mockQualityMenu.style.display, "none");
    assert.equal(activePopover, null);

    // 1st click
    togglePopover("quality");
    assert.equal(mockQualityMenu.style.display, "flex");
    assert.equal(mockBtnQuality.classList.contains("is-active"), true);
    assert.equal(mockBtnQuality.attributes["aria-expanded"], "true");
    assert.equal(activePopover, "quality");

    // 2nd click
    togglePopover("quality");
    assert.equal(mockQualityMenu.style.display, "none");
    assert.equal(mockBtnQuality.classList.contains("is-active"), false);
    assert.equal(mockBtnQuality.attributes["aria-expanded"], "false");
    assert.equal(activePopover, null);
  });

  await t.test("1st click opens Shortcuts, 2nd click closes Shortcuts", () => {
    togglePopover("shortcuts");
    assert.equal(mockShortcutsDialog.style.display, "flex");
    assert.equal(activePopover, "shortcuts");

    togglePopover("shortcuts");
    assert.equal(mockShortcutsDialog.style.display, "none");
    assert.equal(activePopover, null);
  });

  await t.test("1st click opens Prefs, 2nd click closes Prefs", () => {
    togglePopover("prefs");
    assert.equal(mockPrefsDialog.style.display, "flex");
    assert.equal(activePopover, "prefs");

    togglePopover("prefs");
    assert.equal(mockPrefsDialog.style.display, "none");
    assert.equal(activePopover, null);
  });

  await t.test("Mutual Exclusivity: opening one immediately closes any open popover", () => {
    // Open Quality
    togglePopover("quality");
    assert.equal(mockQualityMenu.style.display, "flex");
    assert.equal(mockShortcutsDialog.style.display, "none");
    assert.equal(mockPrefsDialog.style.display, "none");
    assert.equal(activePopover, "quality");

    // Click Shortcuts without closing Quality first -> Quality MUST close, Shortcuts opens
    togglePopover("shortcuts");
    assert.equal(mockQualityMenu.style.display, "none", "Quality must close when Shortcuts opens");
    assert.equal(mockShortcutsDialog.style.display, "flex", "Shortcuts must open");
    assert.equal(mockPrefsDialog.style.display, "none");
    assert.equal(activePopover, "shortcuts");

    // Click Prefs without closing Shortcuts first -> Shortcuts MUST close, Prefs opens
    togglePopover("prefs");
    assert.equal(mockShortcutsDialog.style.display, "none", "Shortcuts must close when Prefs opens");
    assert.equal(mockQualityMenu.style.display, "none");
    assert.equal(mockPrefsDialog.style.display, "flex", "Prefs must open");
    assert.equal(activePopover, "prefs");

    // Click Quality again -> Prefs MUST close, Quality opens
    togglePopover("quality");
    assert.equal(mockPrefsDialog.style.display, "none", "Prefs must close when Quality opens");
    assert.equal(mockQualityMenu.style.display, "flex", "Quality must open");
    assert.equal(activePopover, "quality");

    // Click Quality once more -> closes cleanly
    togglePopover("quality");
    assert.equal(mockQualityMenu.style.display, "none");
    assert.equal(activePopover, null);
  });
});
