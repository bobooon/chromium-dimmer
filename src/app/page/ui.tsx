import type { SliderProps, SwitchProps, TooltipProps } from '@radix-ui/themes'
import { Box, Flex, IconButton, Slider, Switch, Text, Tooltip } from '@radix-ui/themes'
import { Info } from 'lucide-react'

interface UiSwitchProps extends SwitchProps {
  label: string
  tooltip?: string
}

export function UiSwitch(props: UiSwitchProps) {
  const { label, tooltip, ...restProps } = props

  return (
    <Flex asChild align="center" gap="2">
      <Text as="label" size="2">
        {tooltip && <UiTooltip content={tooltip} />}
        <Text style={{ flexGrow: 1 }}>
          {label}
        </Text>
        <Switch {...restProps} />
      </Text>
    </Flex>
  )
}

interface UiSliderProps extends SliderProps {
  label: string
  tooltip?: string
  unit: string
}

export function UiSlider(props: UiSliderProps) {
  const { label, tooltip, unit, ...restProps } = props

  return (
    <Box>
      <Flex mb="2" align="center" gap="2">
        {tooltip && <UiTooltip content={tooltip} />}
        <Text size="2" style={{ flexGrow: 1 }}>
          {label}
        </Text>
        {props.value && (
          <Text size="2" color="gray">
            {props.value[0]}
            {unit}
          </Text>
        )}
      </Flex>
      <Slider {...restProps} />
    </Box>
  )
}

export function UiTooltip(props: TooltipProps) {
  return (
    <Tooltip {...props}>
      <IconButton variant="ghost" color="gray" size="1" radius="full">
        <Info size={16} color="gray" />
      </IconButton>
    </Tooltip>
  )
}
