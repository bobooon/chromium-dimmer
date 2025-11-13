import type { Settings } from '../extension/settings.ts'

interface State { settings: Settings }

const actions = {
  setSettings: (state: State, value: Settings) => {
    state.settings = structuredClone(value)
  },
  setOn: (state: State, value: boolean) => {
    state.settings.url.on = value
  },
  setMode: (state: State, value: boolean) => {
    state.settings.url.mode = value ? 'global' : 'url'
  },
  setBlend: (state: State, value: string) => {
    state.settings[state.settings.url.mode].overlay.blend = value
  },
  setOpacity: (state: State, value: number[]) => {
    state.settings[state.settings.url.mode].overlay.opacity = value[0] / 100
  },
  setColor: (state: State, value: string) => {
    state.settings[state.settings.url.mode].overlay.color = value
  },
}

type Action = {
  [K in keyof typeof actions]: {
    type: K
    value: Parameters<typeof actions[K]>[1]
  }
}[keyof typeof actions]

export function pageReducer(prevState: State, action: Action) {
  const state = structuredClone(prevState)

  if (actions[action.type]) {
    const handler = actions[action.type] as (state: State, value: any) => void
    handler(state, action.value)
  }

  return state
}
