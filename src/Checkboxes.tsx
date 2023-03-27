import { Promisable } from 'base-up'
import { createMemo, createRenderEffect, For, JSX, on, untrack } from 'solid-js'
import { createSignalObject } from 'solid-signal-object'
import { Checkbox } from './Checkbox'
import css from './Checkboxes.scss'
import { joinClasses, joinStyle, prepareProps, Props } from './utility/props'
import { registerCss } from './utility/registerCss'

registerCss(css)

export type CheckboxesProps<T extends readonly (string | number)[]> = Props<{
  values: T
  labels?: Partial<Record<T[number], JSX.Element>>
  selected?: ReadonlySet<T[number]>
  placeholder?: string
  layout?: 'horizontal' | 'vertical' | 'flex-wrap' | 'space-between' | 'space-around' | 'space-evenly'
  gap?: string
  gridColumnsCount?: number | undefined
  disabled?: boolean | ReadonlySet<T[number]>
  required?: boolean
  error?: boolean | string | ((selected: ReadonlySet<T[number]>) => Promisable<boolean | string>)
  validateImmediately?: boolean
  fullWidth?: boolean
  showSearchBox?: boolean
  onChangeSelected?: (selected: Set<T[number]>) => void
  onChangeValidSelected?: (selected: Set<T[number]>) => void
}>

export function Checkboxes<T extends readonly (string | number)[]>(rawProps: CheckboxesProps<T>) {
  const [props, restProps] = prepareProps(
    rawProps,
    {
      labels: {} as Required<CheckboxesProps<T>>['labels'],
      selected: new Set(),
      placeholder: '',
      layout: 'horizontal',
      gap: '0.2em 1em',
      disabled: false,
      required: false,
      error: false as Required<CheckboxesProps<T>>['error'],
      validateImmediately: false,
      fullWidth: false,
      showSearchBox: false,
    },
    ['values', 'gridColumnsCount', 'onChangeSelected']
  )

  function getLabel(value: T[number]): JSX.Element {
    return props.labels?.[value] ?? value
  }

  const selectedSignal = createSignalObject(new Set(props.selected), { equals: false })
  createRenderEffect(() => (selectedSignal.value = new Set(props.selected)))
  async function changeSelected(newSelected: Set<T[number]>) {
    selectedSignal.value = newSelected
    props.onChangeSelected?.(newSelected)

    const newError = await deriveError(shouldValidate(), newSelected, props.error, props.required)
    errorSignal.value = newError
    if (newError === undefined) {
      props.onChangeValidSelected?.(newSelected)
    }
  }

  const isEditedSignal = createSignalObject(false)
  const shouldValidate = createMemo(() => isEditedSignal.value || props.validateImmediately)

  const errorSignal = createSignalObject<boolean | string>(false)
  createRenderEffect(async () => {
    errorSignal.value = await deriveError(shouldValidate(), untrack(selectedSignal.get), props.error, props.required)
  })
  createRenderEffect(
    on(
      () => props.selected,
      async () => {
        errorSignal.value = await deriveError(shouldValidate(), props.selected, props.error, props.required)
      },
      { defer: true }
    )
  )

  async function deriveError(
    shouldValidate: boolean,
    selected: ReadonlySet<T[number]>,
    error: Required<CheckboxesProps<T>>['error'],
    required: boolean
  ): Promise<boolean | string> {
    if (error === true) return true

    if (required) {
      if (!shouldValidate) {
        return false
      } else if (error === false) {
        return selected.size === 0
      } else if (typeof error === 'string') {
        if (selected.size > 0) {
          return false
        } else {
          return error
        }
      } else {
        const result = await error(selected)
        if (selected.size === 0 && result === false) return true

        return result
      }
    } else {
      if (error === false || typeof error === 'string') {
        return error
      } else if (!shouldValidate) {
        return false
      } else {
        return await error(selected)
      }
    }
  }

  function isDisabled(value: T[number]): boolean {
    if (typeof props.disabled === 'boolean') return props.disabled

    return props.disabled.has(value)
  }

  return (
    <div
      class={joinClasses(rawProps, 'solid-design-parts-Checkboxes_root', {
        'solid-design-parts-Checkboxes_has-columns-count': props.gridColumnsCount !== undefined,
      })}
      style={joinStyle(rawProps.style, {
        '--solid-design-parts-Checkboxes_gap': props.gap,
        '--solid-design-parts-Checkboxes_grid-columns-count': props.gridColumnsCount,
      })}
      aria-invalid={errorSignal.value !== false}
      data-layout={props.layout}
      data-grid-columns-count={props.gridColumnsCount}
    >
      <div class="solid-design-parts-Checkboxes_checkboxes" role="group" aria-required={props.required}>
        <For each={props.values}>
          {(value) => (
            <Checkbox
              checked={selectedSignal.value.has(value)}
              disabled={isDisabled(value)}
              error={errorSignal.value !== false}
              onChangeChecked={(checked) => {
                isEditedSignal.value = true
                if (checked) {
                  selectedSignal.value.add(value)
                } else {
                  selectedSignal.value.delete(value)
                }
                changeSelected(selectedSignal.value)
              }}
            >
              {getLabel(value)}
            </Checkbox>
          )}
        </For>
      </div>
      <p class="solid-design-parts-Checkboxes_error-message">{errorSignal.value}</p>
    </div>
  )
}
