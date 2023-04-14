import { Show } from 'solid-js'
import { createSignalObject } from 'solid-signal-object'
import './Button.scss'
import './common.scss'
import { Gravity } from './Gravity'
import { LayerLayout } from './LayerLayout'
import { Spinner } from './Spinner'
import { joinClasses, joinStyle, prepareProps, Props } from './utility/props'

export type ButtonProps = Props<{
  color?: 'primary' | 'achromatic' | 'error'
  variant?: 'solid' | 'ghost'
  disabled?: boolean
  fullWidth?: boolean
  type?: 'submit' | 'button' | 'reset'
  href?: string
  radius?: string
  onClick?: (event: MouseEvent) => unknown
}>

export function Button(rawProps: ButtonProps) {
  const [props, restProps] = prepareProps(
    rawProps,
    {
      color: 'primary',
      variant: 'solid',
      disabled: false,
      fullWidth: false,
      type: 'button',
      radius: '0.3em',
    },
    ['href', 'onClick']
  )

  const isInProgress = createSignalObject(false)

  function clickEventHandler(event: MouseEvent) {
    const promise = props.onClick?.(event)
    if (promise instanceof Promise) {
      isInProgress.value = true
      promise.finally(() => (isInProgress.value = false))
    }
  }

  const content = (
    <Show when={isInProgress.value} fallback={rawProps.children}>
      <LayerLayout>
        <div class="solid-design-parts-Button_invisible-children" aria-hidden={true}>
          {rawProps.children}
        </div>
        <Gravity>
          <Spinner color="currentColor" />
        </Gravity>
      </LayerLayout>
    </Show>
  )

  if (props.href !== undefined) {
    return (
      <a
        {...restProps}
        class={joinClasses(rawProps, 'solid-design-parts-Button_root', {
          'solid-design-parts-Button_full-width': props.fullWidth,
        })}
        style={joinStyle(rawProps.style, { '--solid-design-parts-Button_radius': props.radius })}
        href={props.href}
        role="button"
        tabindex={props.disabled ? -1 : 0}
        aria-disabled={props.disabled}
        data-variant={props.variant}
        data-color={props.color}
        onClick={clickEventHandler}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      {...restProps}
      class={joinClasses(rawProps, 'solid-design-parts-Button_root', {
        'solid-design-parts-Button_full-width': props.fullWidth,
      })}
      style={joinStyle(rawProps.style, { '--solid-design-parts-Button_radius': props.radius })}
      type={props.type}
      data-variant={props.variant}
      data-color={props.color}
      disabled={props.disabled || isInProgress.value}
      aria-disabled={props.disabled}
      onClick={clickEventHandler}
    >
      {content}
    </button>
  )
}

/** <Button.ghost ...> is shorthand for <Button variant="ghost" ...> */
Button.ghost = (props: ButtonProps) => <Button variant="ghost" {...props} />

/** <Button.solid ...> is shorthand for <Button variant="solid" ...> */
Button.solid = (props: ButtonProps) => <Button variant="solid" {...props} />