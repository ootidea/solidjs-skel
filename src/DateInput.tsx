import { Show } from 'solid-js'
import './common.scss'
import './DateInput.scss'
import { DatePicker } from './DatePicker'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import calendarIcon from './image/calendar.svg'
import closeCircleIcon from './image/close-circle.svg'
import { Modal } from './Modal'
import { isNestedClickEvent } from './utility/others'
import {
  createDeferEffect,
  createNormalizedSignalObject,
  joinClasses,
  prepareProps,
  Props,
  SlotProp,
} from './utility/props'
import { Slot } from './utility/Slot'

export type DateInputProps = Props<{
  value?: Date | undefined
  placeholder?: string
  disabled?: boolean | ((date: Date) => boolean)
  showClearButton?: boolean
  onChangeValue?: ((value: Date | undefined) => void) | undefined
  format?: SlotProp<{ value: Date | undefined }>
}>

export function DateInput(rawProps: DateInputProps) {
  const [props, restProps] = prepareProps(
    rawProps,
    { disabled: false as Required<DateInputProps>['disabled'], showClearButton: false },
    ['value', 'placeholder', 'onChangeValue', 'format']
  )

  const valueSignal = createNormalizedSignalObject(
    props.value,
    () => {
      if (props.value !== undefined && props.disabled instanceof Function && props.disabled(props.value)) {
        return undefined
      }
      return props.value
    },
    props.onChangeValue
  )
  createDeferEffect(valueSignal.get, () => props.onChangeValue?.(valueSignal.value))

  const dummyDate = new Date(9999, 11, 29, 23, 59, 59, 999)

  return (
    <Modal
      launcher={({ toggle }) => (
        <button
          {...restProps}
          class={joinClasses(props, 'solid-design-parts-DateInput_launcher')}
          type="button"
          disabled={props.disabled === true}
          onClick={(event) => {
            if (isNestedClickEvent(event)) return

            toggle()
          }}
        >
          <div class="solid-design-parts-DateInput_preview-area">
            <Show when={valueSignal.value !== undefined}>
              <div class="solid-design-parts-DateInput_format">
                <Slot content={props.format} params={{ value: valueSignal.value }}>
                  {valueSignal.value!.toLocaleDateString()}
                </Slot>
              </div>
            </Show>
            <div
              class="solid-design-parts-DateInput_placeholder"
              classList={{ 'solid-design-parts-DateInput_invisible': valueSignal.value !== undefined }}
            >
              {props.placeholder}
            </div>
            <div class="solid-design-parts-DateInput_format solid-design-parts-DateInput_invisible">
              {/* Intended to be the maximum rendering width */}
              <Slot content={props.format} params={{ value: dummyDate }}>
                {dummyDate.toLocaleDateString()}
              </Slot>
            </div>
          </div>
          <Show when={props.showClearButton}>
            <IconButton
              class="solid-design-parts-DateInput_clear-button"
              src={closeCircleIcon}
              size="1.6em"
              iconSize="1.25em"
              iconColor="var(--solid-design-parts-clear-button-icon-default-color)"
              aria-hidden={valueSignal.value === undefined}
              onClick={() => (valueSignal.value = undefined)}
            />
          </Show>
          <Icon class="solid-design-parts-DateInput_icon" src={calendarIcon} size="1.3em" />
        </button>
      )}
    >
      {({ close }) => (
        <DatePicker
          class="solid-design-parts-DateInput_date-picker"
          value={valueSignal.value}
          disabled={props.disabled instanceof Function ? props.disabled : undefined}
          onChangeValue={(value) => {
            valueSignal.value = value
            close()
          }}
        />
      )}
    </Modal>
  )
}
