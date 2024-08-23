// This code is a Chrome extension that queries for tabs with URLs that match
// certain patterns, sorts them by title using the browser's built-in
// Intl.Collator, and then displays them in a popup window along with a button
// that groups the tabs into a tab group.
// Copyright 2022 Google LLC
//
// The extension first queries for tabs with URLs that match
// 'https://developer.chrome.com/docs/webstore/*' and
// 'https://developer.chrome.com/docs/extensions/*'. It uses the
// chrome.tabs.query() function to get a list of tabs that match the URL
// patterns.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// The code then sorts the tabs by title using the Intl.Collator class. This
// class provides a way to compare strings in a locale-sensitive way, which is
// useful for sorting strings correctly in different languages.
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Next, the code gets a reference to the <template> element in the popup's HTML
// using document.getElementById(). It then clones the template element and
// modifies its content to display information about each tab. The title of each
// tab is extracted from the tab's title property, and the pathname of the URL is
// extracted and displayed. The code also adds a click event listener to each
// link in the popup, which updates the active tab and window when clicked.
//
// Finally, the code gets a reference to the <button> element in the popup's HTML
// and adds a click event listener to it. When the button is clicked, the
// extension groups all of the tabs into a single tab group using the
// chrome.tabs.group() function. It then updates the title of the tab group to
// 'DOCS' using the chrome.tabGroups.update() function.
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const tabs = await chrome.tabs.query({
  url: [
    'https://developer.chrome.com/docs/webstore/*',
    'https://developer.chrome.com/docs/extensions/*'
  ]
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById('li_template');
const elements = new Set();
for (const tab of tabs) {
  // Clone the template element to create a new list item element for each tab.
  // The template element is a <template> element that contains a single <li>
  // element as its content. The cloneNode(true) method is called to create a
  // deep copy of the template element, which includes all of its child nodes.
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split('|')[0].trim();
  const pathname = new URL(tab.url).pathname.slice('/docs'.length);

  element.querySelector('.title').textContent = title;
  element.querySelector('.pathname').textContent = pathname;
  element.querySelector('a').addEventListener('click', async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.querySelector('ul').append(...elements);

const button = document.querySelector('button');
button.addEventListener('click', async () => {
  const tabIds = tabs.map(({ id }) => id);
  if (tabIds.length) {
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: 'DOCS' });
  }
});