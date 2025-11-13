import type { Settings } from './settings.ts'
import { getDefaultSettings } from './settings.ts'

async function updateTabs(tabId?: number) {
  try {
    const tabs = tabId
      ? [await chrome.tabs.get(tabId)]
      : (await chrome.tabs.query({ active: true }))

    await Promise.allSettled(
      tabs.map(async (tab) => {
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'update',
            payload: { settings: await getSettings(tab.id) },
          })
        }
      }),
    )
  }
  catch {}
}

async function getSettings(tabId?: number) {
  const settings = getDefaultSettings()
  settings.global = (await chrome.storage.local.get(['_global']))._global || settings.global

  try {
    const tab = tabId
      ? (await chrome.tabs.get(tabId))
      : (await chrome.tabs.query({ currentWindow: true, active: true })).pop()

    if (tab?.id && tab?.url) {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => true })
      const { hostname } = new URL(tab.url)
      settings.url.hostname = hostname
      settings.url = (await chrome.storage.local.get([hostname]))[hostname] || settings.url
    }
  }
  catch {}

  return settings
}

async function saveSettings(newSettings: Settings) {
  if (newSettings.url.hostname === '*' || newSettings.url.mode === 'global')
    await chrome.storage.local.set({ _global: newSettings.global })
  if (newSettings.url.hostname !== '*')
    await chrome.storage.local.set({ [newSettings.url.hostname]: newSettings.url })

  await updateTabs()
}

chrome.runtime.onMessage.addListener((message, _sender, response) => {
  switch (message.type) {
    case 'getSettings':
      getSettings().then(settings => response(settings))
      return true

    case 'saveSettings':
      saveSettings(message.payload).then(() => response(true))
      return true

    case 'resetSettings':
      chrome.storage.local.clear().then(() => updateTabs().then(() => response(true)))
      return true
  }
})

// Watch for tab URL changes and activation.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete')
    await updateTabs(tabId)
})

chrome.tabs.onActivated.addListener(async activeInfo => await updateTabs(activeInfo.tabId))

// Watch for toggle command shortcut.
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle') {
    const settings = await getSettings()
    settings.url.on = !settings.url.on
    await saveSettings(settings)
  }
})
