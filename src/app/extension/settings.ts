const overlay = {
  blend: 'normal',
  opacity: 0.5,
  color: '#000000',
}

export const defaultSettings = {
  global: { overlay },
  url: {
    hostname: '*',
    mode: 'global' as 'global' | 'url',
    on: false,
    overlay,
  },
}

export type Settings = typeof defaultSettings

export function getDefaultSettings() {
  return structuredClone(defaultSettings) as Settings
}
