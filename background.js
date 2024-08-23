// service worker background.js
chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps, tab) {
  // We are waiting for the tab we opened to finish loading.
  // Check that the tab's id matches the tab we opened,
  // and that the tab is done loading.
  if (changedProps.status != 'complete') return;  
  
  console.log("service worker started running for tab", tabId);
  console.log(tab);
  console.log(tab.url);
  const url = new URL(tab.url);
  if (url.hostname === 'github.com') {
    UpdateTabGroup('GHUB', tabId);    
  }
});


/**
 * Finds or creates a tab group with the given title and tabId.
 *
 * @param {string} title the title of the tab group to find or create
 * @returns {Promise<number>} the ID of the found or created tab group
 */
async function UpdateTabGroup(title, tabId) {
  const tabGroups = await chrome.tabGroups.query({ title });  
  console.log("tabGroups", tabGroups);
  if (tabGroups.length > 0) {
    tabGroupId =tabGroups[0].id;
    chrome.tabs.group({ groupId: tabGroupId, tabIds: [tabId] });
  } else {
    console.log({title}, "TabGroup does not exist");
    const groupId = await chrome.tabs.group({ tabIds: [tabId] });
    console.log({title}, "TabGroup created", groupId);
    chrome.tabGroups.update(groupId, { title: 'GHUB' });
  }
}