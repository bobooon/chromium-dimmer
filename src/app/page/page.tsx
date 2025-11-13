import { Box, Button, Callout, DropdownMenu, Flex, Select, Separator } from '@radix-ui/themes'
import { AlertCircle } from 'lucide-react'
import { useEffect, useReducer, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { api } from '../extension/api.ts'
import { getDefaultSettings } from '../extension/settings.ts'
import { pageReducer } from './reducer.ts'
import { UiSlider, UiSwitch } from './ui.tsx'
import './page.css'

export default function Page() {
  const [ready, setReady] = useState(false)
  const [reset, setReset] = useState(false)
  const [state, dispatch] = useReducer(pageReducer, { settings: getDefaultSettings() })

  useEffect(() => {
    (async () => {
      if (!ready) {
        dispatch({ type: 'setSettings', value: await api.getSettings() })
        setReady(true)
      }
      else {
        await api.saveSettings(state.settings, reset)
        setReset(false)
      }
    })()
  }, [ready, reset, state.settings])

  if (!ready)
    return <Box p="5" className="wrapper" />

  const { settings } = state

  if (settings.url.hostname === '*' && !import.meta.env.DEV) {
    return (
      <Box className="wrapper">
        <Callout.Root variant="soft" color="red" size="2" style={{ borderRadius: 0 }}>
          <Callout.Icon>
            <AlertCircle size={16} />
          </Callout.Icon>
          <Callout.Text>
            {api.getMessage('disabledHelp')}
          </Callout.Text>
        </Callout.Root>
      </Box>
    )
  }

  const onReset = async (all = false) => {
    if (!window.confirm(api.getMessage(all ? 'resetAllConfirm' : 'resetUrlConfirm')))
      return

    const settings = getDefaultSettings()
    settings.url.hostname = state.settings.url.hostname

    if (!all)
      settings.global = state.settings.global

    dispatch({ type: 'setSettings', value: settings })
    setReset(all)
  }

  const mode = state.settings[state.settings.url.mode]
  const id = typeof chrome.runtime !== 'undefined' ? chrome.runtime.id : ''

  return (
    <Flex p="5" direction="column" gap="3" className="wrapper">
      <UiSwitch
        label={api.getMessage('toggle')}
        tooltip={api.getMessage('toggleHelp')}
        checked={settings.url.on}
        onCheckedChange={value => dispatch({ type: 'setOn', value })}
      />
      <UiSwitch
        label={api.getMessage('global')}
        tooltip={api.getMessage('globalHelp')}
        checked={settings.url.mode === 'global'}
        onCheckedChange={value => dispatch({ type: 'setMode', value })}
      />

      <Box my="3" mx="-5">
        <Separator size="4" />
      </Box>

      <Select.Root
        value={mode.overlay.blend}
        onValueChange={value => dispatch({ type: 'setBlend', value })}
      >
        <Select.Trigger />
        <Select.Content>
          <Select.Group>
            <Select.Label>{api.getMessage('blend')}</Select.Label>
            <Select.Item value="color-burn">{api.getMessage('blendColorBurn')}</Select.Item>
            <Select.Item value="darken">{api.getMessage('blendDarken')}</Select.Item>
            <Select.Item value="difference">{api.getMessage('blendDifference')}</Select.Item>
            <Select.Item value="exclusion">{api.getMessage('blendExclusion')}</Select.Item>
            <Select.Item value="hard-light">{api.getMessage('blendHardLight')}</Select.Item>
            <Select.Item value="luminosity">{api.getMessage('blendLuminosity')}</Select.Item>
            <Select.Item value="multiply">{api.getMessage('blendMultiply')}</Select.Item>
            <Select.Item value="normal">{api.getMessage('blendNormal')}</Select.Item>
            <Select.Item value="saturation">{api.getMessage('blendSaturation')}</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <Box mb="1">
        <UiSlider
          label={api.getMessage('opacity')}
          tooltip={api.getMessage('opacityHelp')}
          step={1}
          min={0}
          max={100}
          unit="%"
          value={[Math.round(mode.overlay.opacity * 100)]}
          onValueChange={value => dispatch({ type: 'setOpacity', value })}
        />
      </Box>

      <HexColorPicker
        className="color-picker"
        color={mode.overlay.color}
        onChange={value => dispatch({ type: 'setColor', value })}
      />

      <Box my="3" mx="-5">
        <Separator size="4" />
      </Box>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="soft">
            {api.getMessage('advanced')}
            <DropdownMenu.TriggerIcon />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={() => api.createTab(`chrome://extensions/?id=${id}`)}>
            {api.getMessage('extensionInfo')}
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => api.createTab('chrome://extensions/shortcuts')}>
            {api.getMessage('extensionShortcuts')}
          </DropdownMenu.Item>

          <DropdownMenu.Separator />

          <DropdownMenu.Item color="red" onClick={() => onReset()}>
            {api.getMessage('resetUrl')}
          </DropdownMenu.Item>
          <DropdownMenu.Item color="red" onClick={() => onReset(true)}>
            {api.getMessage('resetAll')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  )
}
