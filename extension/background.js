// Service worker. Strips the headers that stop sites being framed, but only for frames loaded in
// tabs that are showing Unlined. The rule is keyed by tab id, not by initiator: once someone clicks
// a link inside a frame, the framed site is the initiator of the next navigation.
importScripts('shared.js');

const { isAppOrigin } = globalThis.UnlinedWeb;

const RULE_ID = 1;
const KEY = 'unlinedTabs';
const APP_URLS = ['https://unlined.1azy.ink/*', 'http://localhost/*', 'http://127.0.0.1/*'];

/** Whether a tab's top-level URL is Unlined. */
function isAppUrl(url) {
  try {
    return isAppOrigin(new URL(url).origin);
  } catch {
    return false;
  }
}

/** Installs (or clears, when no tab is left) the session rule for the given tabs. */
async function applyRule(tabIds) {
  const addRules =
    tabIds.length === 0
      ? []
      : [
          {
            id: RULE_ID,
            priority: 1,
            // Whole headers only: declarativeNetRequest cannot edit a CSP, so the framed page loses all of it.
            action: {
              type: 'modifyHeaders',
              responseHeaders: [
                { header: 'x-frame-options', operation: 'remove' },
                { header: 'content-security-policy', operation: 'remove' },
              ],
            },
            condition: { tabIds, resourceTypes: ['sub_frame'] },
          },
        ];
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [RULE_ID], addRules });
}

// The worker is killed when idle, so the tab set lives in session storage rather than in memory.
// Changes are queued so that two events in a row cannot overwrite each other.
let queue = Promise.resolve();

/** Applies `change` to the stored set of Unlined tab ids and brings the rule in line with it. */
function updateTabs(change) {
  queue = queue
    .then(async () => {
      const stored = (await chrome.storage.session.get(KEY))[KEY] ?? [];
      const tabs = new Set(stored);
      change(tabs);
      // Most tab events are for tabs that never showed Unlined.
      if (tabs.size === stored.length && stored.every((id) => tabs.has(id))) return;
      await chrome.storage.session.set({ [KEY]: [...tabs] });
      await applyRule([...tabs]);
    })
    .catch((error) => console.error('Unlined Web:', error));
  return queue;
}

/** Starts from the tabs that are showing Unlined right now. */
async function rebuild() {
  const open = await chrome.tabs.query({ url: APP_URLS });
  await updateTabs((tabs) => {
    tabs.clear();
    for (const tab of open) if (tab.id !== undefined) tabs.add(tab.id);
  });
}

chrome.runtime.onInstalled.addListener(rebuild);
chrome.runtime.onStartup.addListener(rebuild);

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'register' || sender.tab?.id === undefined || !isAppUrl(sender.url)) return;
  const id = sender.tab.id;
  updateTabs((tabs) => tabs.add(id));
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url === undefined) return;
  const app = isAppUrl(changeInfo.url);
  updateTabs((tabs) => (app ? tabs.add(tabId) : tabs.delete(tabId)));
});

chrome.tabs.onRemoved.addListener((tabId) => {
  updateTabs((tabs) => tabs.delete(tabId));
});
