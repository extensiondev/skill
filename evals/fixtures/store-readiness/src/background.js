chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-quote',
    title: 'Save quote to Quote Keeper',
    contexts: ['selection']
  })
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'save-quote' || !info.selectionText) return
  const {quotes = []} = await chrome.storage.local.get('quotes')
  quotes.push({text: info.selectionText, savedAt: Date.now()})
  await chrome.storage.local.set({quotes})
})
