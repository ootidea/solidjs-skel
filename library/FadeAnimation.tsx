import { Show } from 'solid-js'
import { createSignalObject } from 'solid-signal-object'
import './common.scss'
import { createDeferEffect, prepareProps, Props, SlotProp } from './utility/props'
import { Slot } from './utility/Slot'

export type FadeAnimationProps<T> = Props<{
  shown?: T | undefined | null
  durationMs?: number
  onFinishEnterAnimation?: () => void
  onFinishExitAnimation?: () => void
  children?: SlotProp<T>
}>

export function FadeAnimation<T>(rawProps: FadeAnimationProps<T>) {
  const [props, restProps] = prepareProps(rawProps, { durationMs: 250 }, [
    'shown',
    'onFinishEnterAnimation',
    'onFinishExitAnimation',
    'children',
  ])

  let element: HTMLDivElement | undefined

  // Signal variable indicating whether props.children should be present on the DOM.
  const shown = createSignalObject(Boolean(props.shown))

  // A variable required to render props.children until animation is complete.
  let lastNonFalsyShown = props.shown
  createDeferEffect(
    () => props.shown,
    () => {
      if (props.shown) {
        lastNonFalsyShown = props.shown
      }

      changeShown(Boolean(props.shown))
    }
  )

  function changeShown(newShown: boolean) {
    if (newShown === Boolean(shown.value)) return

    const options: KeyframeAnimationOptions = { duration: props.durationMs }

    if (!newShown) {
      const animation = element?.animate([{ opacity: 1 }, { opacity: 0 }], options)
      animation?.addEventListener('finish', () => {
        shown.value = newShown
        props.onFinishExitAnimation?.()
      })
    } else {
      shown.value = newShown
      const animation = element?.animate([{ opacity: 0 }, { opacity: 1 }], options)
      animation?.addEventListener('finish', () => {
        props.onFinishEnterAnimation?.()
      })
    }
  }

  return (
    <div class="solid-design-parts-FadeAnimation_root" ref={element}>
      <Show when={shown.value}>
        <Slot content={props.children} params={lastNonFalsyShown!} />
      </Show>
    </div>
  )
}