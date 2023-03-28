import { assert, clamp, isNotUndefined, minBy } from 'base-up'
import { onMount } from 'solid-js'
import { createMemoObject, createSignalObject } from 'solid-signal-object'
import css from './Slider.scss'
import { CssColor } from './utility/color'
import { observeWidthPx } from './utility/others'
import { createDeferEffect, joinClasses, prepareProps, Props } from './utility/props'
import { registerCss } from './utility/registerCss'

registerCss(css)

export type SliderProps = Props<{
  value?: number
  min?: number
  max?: number
  stops?: readonly number[]
  step?: number
  offset?: number
  trackColor?: CssColor
  trackFillColor?: CssColor
  thumbWidth?: string
  thumbHeight?: string
  thumbColor?: CssColor
  onChangeValue?: (value: number) => void
}>

export function Slider(rawProps: SliderProps) {
  const [props, restProps] = prepareProps(
    rawProps,
    {
      min: 0,
      max: 1,
      value: rawProps.min ?? 0,
      trackColor: 'var(--solid-design-parts-Slider_track-default-color)',
      trackFillColor: 'var(--solid-design-parts-Slider_track-default-fill-color)',
      thumbWidth: 'var(--solid-design-parts-Slider_thumb-default-width)',
      thumbHeight: 'var(--solid-design-parts-Slider_thumb-default-height)',
      thumbColor: 'var(--solid-design-parts-Slider_thumb-default-color)',
    },
    ['stops', 'step', 'offset', 'onChangeValue']
  )

  const stops = createMemoObject(() => {
    if (props.stops !== undefined) return [props.min, ...props.stops, props.max]

    if (props.step !== undefined) {
      const result = []
      for (let i = props.min + (props.offset ?? 0); i < props.max; i += props.step) {
        result.push(i)
      }
      result.push(props.max)
      return result
    }

    return undefined
  })

  const valueSignal = createSignalObject(correctValue(props.value))
  createDeferEffect(
    () => props.value,
    () => (valueSignal.value = correctValue(props.value))
  )
  // A variable between 0 and 1 that indicates where the 'value' is positioned between 'min' and 'max'.
  const ratio = createMemoObject(() => (valueSignal.value - props.min) / (props.max - props.min))

  // Update the internal state and notify it.
  // If it is a discrete slider, the value will be the nearest stop.
  function changeValue(newValue: number) {
    const value = correctValue(newValue)
    valueSignal.value = value
    props.onChangeValue?.(value)
  }

  // If it is a discrete slider, it is corrected to the nearest stop.
  function correctValue(value: number): number {
    if (stops.value === undefined) {
      return clamp(props.min, value, props.max)
    } else {
      return minBy(stops.value, (stop) => Math.abs(stop - value))!
    }
  }

  const trackWidthPx = createSignalObject(0)
  const thumbWidthPx = createSignalObject(0)
  let trackElement: HTMLDivElement | undefined = undefined

  function onMouseDownTrack(event: MouseEvent) {
    event.preventDefault()
    changeValue(convertOffsetXToValue(event.offsetX))
    document.body.addEventListener('mousemove', onMouseMove)
  }

  function onMouseMove(event: MouseEvent) {
    // If left mouse button is not pressed
    if ((event.buttons & 1) === 0) {
      document.body.removeEventListener('mousemove', onMouseMove)
      return
    }

    if (trackElement === undefined) return

    const offsetX = event.clientX - trackElement.getBoundingClientRect().x
    changeValue(convertOffsetXToValue(offsetX))
  }

  function onMouseDownThumb(event: MouseEvent) {
    event.preventDefault()

    if (trackElement === undefined) return

    const offsetX = event.clientX - trackElement.getBoundingClientRect().x
    changeValue(convertOffsetXToValue(offsetX))

    document.body.addEventListener('mousemove', onMouseMove)
  }

  function convertOffsetXToValue(offsetX: number): number {
    const clampedOffsetX = clamp(thumbWidthPx.value / 2, offsetX, trackWidthPx.value - thumbWidthPx.value / 2)
    const ratio = (clampedOffsetX - thumbWidthPx.value / 2) / (trackWidthPx.value - thumbWidthPx.value)
    return props.min + ratio * (props.max - props.min)
  }

  onMount(() => {
    assert(trackElement, isNotUndefined)
    observeWidthPx(trackElement, trackWidthPx.set)
  })

  return (
    <div
      {...restProps}
      class={joinClasses(rawProps, 'solid-design-parts-Slider_root')}
      style={{
        '--solid-design-parts-Slider_track-height': 'var(--solid-design-parts-Slider_track-default-height)',
        '--solid-design-parts-Slider_track-background': `linear-gradient(to right, ${props.trackFillColor} ${
          100 * ratio.value
        }%, ${props.trackColor} ${100 * ratio.value}%)`,
        '--solid-design-parts-Slider_thumb-width': props.thumbWidth,
        '--solid-design-parts-Slider_thumb-height': props.thumbHeight,
        '--solid-design-parts-Slider_thumb-color': props.thumbColor,
        '--solid-design-parts-Slider_thumb-x': `${ratio.value * (trackWidthPx.value - thumbWidthPx.value)}px`,
      }}
      role="slider"
    >
      <div class="solid-design-parts-Slider_track" ref={trackElement} onMouseDown={onMouseDownTrack} />
      <div
        class="solid-design-parts-Slider_thumb"
        ref={(element) => observeWidthPx(element, thumbWidthPx.set)}
        onMouseDown={onMouseDownThumb}
      />
    </div>
  )
}
