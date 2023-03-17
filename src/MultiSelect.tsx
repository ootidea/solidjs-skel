import { call, isInstanceOf } from 'base-up'
import { Promisable } from 'base-up/dist/types/Promise'
import { createMemo, createRenderEffect, For, on, Show, untrack } from 'solid-js'
import { Portal } from 'solid-js/web'
import { createSignalObject } from 'solid-signal-object'
import { Checkboxes } from './Checkboxes'
import { Icon } from './Icon'
import chevronDownIcon from './image/chevron-down.svg'
import css from './MultiSelect.scss'
import { Scrollable } from './Scrollable'
import { TextInput } from './TextInput'
import { isNestedClickEvent, setupFocusTrap } from './utility/others'
import { joinClasses, prepareProps, Props } from './utility/props'
import { registerCss } from './utility/registerCss'

registerCss(css)

export type MultiSelectProps<T extends string> = Props<{
  values: readonly T[]
  titles?: Partial<Record<T, string>>
  selected?: ReadonlySet<T>
  placeholder?: string
  disabled?: boolean
  required?: boolean
  errorMessage?: string | ((selected: ReadonlySet<T>) => Promisable<string | void>)
  validateImmediately?: boolean
  fullWidth?: boolean
  showSearchBox?: boolean
  onChangeSelected?: (selected: Set<T>) => void
  onChangeValidSelected?: (selected: Set<T>) => void
}>

export function MultiSelect<T extends string>(rawProps: MultiSelectProps<T>) {
  const [props, restProps] = prepareProps(
    rawProps,
    {
      titles: {} as Required<MultiSelectProps<T>>['titles'],
      selected: new Set(),
      placeholder: '',
      disabled: false,
      required: false,
      validateImmediately: false,
      fullWidth: false,
      showSearchBox: false,
    },
    ['values', 'errorMessage', 'onChangeSelected']
  )

  function getText(value: T): string {
    return props.titles?.[value] ?? value
  }

  const selectedSignal = createSignalObject(new Set(props.selected), { equals: false })
  createRenderEffect(() => (selectedSignal.value = new Set(props.selected)))
  async function changeSelected(newSelected: Set<T>) {
    selectedSignal.value = newSelected
    props.onChangeSelected?.(newSelected)

    const newErrorMessage = await deriveErrorMessage(shouldValidate(), newSelected, props.errorMessage, props.required)
    errorMessageSignal.value = newErrorMessage
    if (newErrorMessage === undefined) {
      props.onChangeValidSelected?.(newSelected)
    }
  }

  const isEditedSignal = createSignalObject(false)
  const shouldValidate = createMemo(() => isEditedSignal.value || props.validateImmediately)

  const errorMessageSignal = createSignalObject<string | undefined>()
  createRenderEffect(async () => {
    errorMessageSignal.value = await deriveErrorMessage(
      shouldValidate(),
      untrack(selectedSignal.get),
      props.errorMessage,
      props.required
    )
  })
  createRenderEffect(
    on(
      () => props.selected,
      async () => {
        errorMessageSignal.value = await deriveErrorMessage(
          shouldValidate(),
          props.selected,
          props.errorMessage,
          props.required
        )
      },
      { defer: true }
    )
  )

  async function deriveErrorMessage(
    shouldValidate: boolean,
    selected: ReadonlySet<T>,
    errorMessage: MultiSelectProps<T>['errorMessage'],
    required: boolean
  ): Promise<string | undefined> {
    if (required) {
      if (!shouldValidate) {
        return undefined
      } else if (typeof errorMessage === 'string') {
        if (selected.size > 0) {
          return undefined
        } else {
          return errorMessage
        }
      } else {
        const result = await errorMessage?.(selected)
        if (selected.size > 0) {
          return result ?? undefined
        } else {
          return result ?? ''
        }
      }
    } else {
      if (typeof errorMessage === 'string') {
        return errorMessage
      } else if (!shouldValidate) {
        return undefined
      } else {
        const result = await errorMessage?.(selected)
        return result ?? undefined
      }
    }
  }

  const followingCount = createMemo(() => selectedSignal.value.size - 1)

  const searchQuerySignal = createSignalObject('')
  function search(values: readonly T[], searchQuery: string): readonly T[] {
    // AND-search
    const searchWords = searchQuery.split(/[ 　]/)
    return values.filter((value) => {
      // case-insensitive search
      const lowerCaseText = getText(value).toLowerCase()
      return searchWords.every((word) => lowerCaseText.includes(word.toLowerCase()))
    })
  }

  type DropdownInfo = { leftPx: number; topPx: number; widthPx: number; maxHeightPx: number }
  const dropdownInfoSignal = createSignalObject<DropdownInfo | undefined>(undefined, {
    equals: false,
  })
  function onClickLauncher(event: MouseEvent) {
    if (isNestedClickEvent(event)) return

    if (!isInstanceOf(event.currentTarget, HTMLElement)) return

    const rect = event.currentTarget.getBoundingClientRect()
    dropdownInfoSignal.value = {
      leftPx: rect.left,
      topPx: rect.bottom,
      widthPx: rect.width,
      maxHeightPx: window.innerHeight - rect.bottom,
    }
  }

  function onOperateOverlay(event: Event) {
    if (event.target !== event.currentTarget) return

    closeDropdown()
  }

  function getPrimarySelectedValue(selected: ReadonlySet<T>): T | undefined {
    const [firstValue] = selected.values()
    return firstValue
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing || event.defaultPrevented) return

    if (event.code === 'Escape' && dropdownInfoSignal.value !== undefined) {
      event.preventDefault()
      closeDropdown()
    }
  }

  function closeDropdown() {
    isEditedSignal.value = true
    dropdownInfoSignal.value = undefined
  }

  return (
    <>
      <div
        class={joinClasses(rawProps, 'solid-design-parts-MultiSelect_error-message-layout', {
          'solid-design-parts-MultiSelect_opened': dropdownInfoSignal.value !== undefined,
          'solid-design-parts-MultiSelect_full-width': props.fullWidth,
        })}
        {...restProps}
      >
        <button
          class="solid-design-parts-MultiSelect_launcher"
          type="button"
          disabled={props.disabled}
          aria-invalid={errorMessageSignal.value !== undefined}
          onClick={onClickLauncher}
        >
          <div class="solid-design-parts-MultiSelect_preview-area">
            {call(() => {
              const previewValue = getPrimarySelectedValue(selectedSignal.value)
              return (
                <>
                  {previewValue !== undefined ? (
                    <div class="solid-design-parts-MultiSelect_preview">
                      <div class="solid-design-parts-MultiSelect_primary-selected-value">{getText(previewValue)}</div>
                      <Show when={followingCount() > 0}>
                        <div class="solid-design-parts-MultiSelect_following-count">+{followingCount()}</div>
                      </Show>
                    </div>
                  ) : null}
                  <div
                    class="solid-design-parts-MultiSelect_placeholder"
                    classList={{ 'solid-design-parts-MultiSelect_invisible': previewValue !== undefined }}
                  >
                    {props.placeholder}
                  </div>
                  <div class="solid-design-parts-MultiSelect_invisible">
                    <div class="solid-design-parts-MultiSelect_preview">
                      <div>
                        <For each={props.values}>
                          {(value) => (
                            <div class="solid-design-parts-MultiSelect_primary-selected-value">{getText(value)}</div>
                          )}
                        </For>
                      </div>
                      <div>
                        <For each={[...Array(props.values.length - 2).keys()]}>
                          {(i) => <div class="solid-design-parts-MultiSelect_following-count">+{i + 1}</div>}
                        </For>
                      </div>
                    </div>
                  </div>
                </>
              )
            })}
          </div>
          <Icon class="solid-design-parts-MultiSelect_icon" src={chevronDownIcon} />
        </button>
        <p class="solid-design-parts-MultiSelect_error-message">{errorMessageSignal.value}</p>
      </div>
      {/* @ts-ignore For some reason, a type error occurs because it is typed as <Show keyed ...>...</Showed> */}
      <Show when={dropdownInfoSignal.value}>
        {(dropdownInfo: DropdownInfo) => (
          <Portal>
            <div
              class="solid-design-parts-MultiSelect_overlay"
              tabindex={-1}
              ref={(element) => setupFocusTrap(element)}
              onClick={onOperateOverlay}
              onTouchMove={onOperateOverlay}
              onMouseWheel={onOperateOverlay}
              onKeyDown={onKeyDown}
            >
              <div
                class="solid-design-parts-MultiSelect_dropdown"
                style={{
                  '--solid-design-parts-MultiSelect_dropdown-left': `${dropdownInfo.leftPx}px`,
                  '--solid-design-parts-MultiSelect_dropdown-top': `${dropdownInfo.topPx}px`,
                  '--solid-design-parts-MultiSelect_dropdown-width': `${dropdownInfo.widthPx}px`,
                  '--solid-design-parts-MultiSelect_dropdown-max-height': `${dropdownInfo.maxHeightPx}px`,
                }}
              >
                <Show when={props.showSearchBox}>
                  <div class="solid-design-parts-MultiSelect_search-box-area">
                    <TextInput
                      class="solid-design-parts-MultiSelect_search-box"
                      placeholder="search"
                      value={searchQuerySignal.value}
                      errorMessage={(value) => {
                        if (search(props.values, value).length === 0) return ''

                        return
                      }}
                      onChangeValue={searchQuerySignal.set}
                    />
                  </div>
                </Show>
                <Scrollable role="menu">
                  <Checkboxes
                    class="solid-design-parts-MultiSelect_options"
                    values={search(props.values, searchQuerySignal.value)}
                    titles={props.titles}
                    layout="vertical"
                    gap="0.5em"
                    selected={selectedSignal.value}
                    disabled={props.disabled}
                    onChangeSelected={(selected) => {
                      changeSelected(selected)
                    }}
                  ></Checkboxes>
                </Scrollable>
              </div>
            </div>
          </Portal>
        )}
      </Show>
    </>
  )
}
