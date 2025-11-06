/// <reference types="vite/client" />

import { Box, Button, DropdownMenu, Flex, Select, Separator, Text } from '@radix-ui/themes'
import { AlertCircle } from 'lucide-react'
import { useEffect, useReducer } from 'react'
import { HexColorPicker } from 'react-colorful'
import { api } from '../extension/api.ts'
import { defaultSettings } from '../extension/settings.ts'
import { pageReducer } from './reducer.ts'
import { UiSlider, UiSwitch } from './ui.tsx'
import './page.css'

export default function Page() {
  const [state, dispatch] = useReducer(pageReducer, { settings: structuredClone(defaultSettings) })
  const { settings } = state
  const mode = settings[settings.url.mode]

  useEffect(() => {
    (async () => dispatch({ type: 'getSettings', value: await api.getSettings() }))()
  }, [])

  if (settings.url.hostname === '*' && !import.meta.env.DEV) {
    return (
      <Flex p="5" width="400px" gap="3">
        <AlertCircle size={20} />
        <Text size="2">
          {api.getMessage('disabledHelp')}
        </Text>
      </Flex>
    )
  }

  const onReset = (all = false) => {
    if (window.confirm(api.getMessage(all ? 'resetAllConfirm' : 'resetUrlConfirm')))
      dispatch({ type: 'reset', value: all })
  }

  return (
    <Box p="5" width="400px">
      <Flex direction="column" gap="3">
        <UiSwitch
          label={api.getMessage(!settings.url.on ? 'on' : 'off')}
          tooltip={api.getMessage('activateHelp')}
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
          defaultValue={mode.overlay.blend}
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

        <Box mb="2">
          <UiSlider
            label={api.getMessage('opacity')}
            tooltip={api.getMessage('opacityHelp')}
            step={1}
            min={0}
            max={100}
            unit="%"
            value={[Math.round(mode.overlay.opacity * 100)]}
            defaultValue={[Math.round(mode.overlay.opacity * 100)]}
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
            <DropdownMenu.Item onClick={() => api.createTab(`chrome://extensions/?id=${chrome?.runtime?.id}`)}>
              {api.getMessage('extensionDetails')}
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
    </Box>
  )
}
