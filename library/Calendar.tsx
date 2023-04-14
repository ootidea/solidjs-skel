import { rangeTo } from 'base-up'
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameMonth,
  max as maxOf,
  min as minOf,
  setDate,
  subDays,
  subMonths,
} from 'date-fns'
import { For } from 'solid-js'
import { createMemoObject } from 'solid-signal-object'
import './Calendar.scss'
import './common.scss'
import { IconButton } from './IconButton'
import chevronLeftIcon from './image/chevron-left.svg'
import chevronRightIcon from './image/chevron-right.svg'
import { i18n } from './utility/i18n'
import { createNormalizedSignalObject, joinClasses, joinStyle, prepareProps, Props, SlotProp } from './utility/props'
import { Slot } from './utility/Slot'

export type CalendarProps = Props<{
  month?: Date
  min?: Date
  max?: Date
  onChangeMonth?: (month: Date) => void
  children?: SlotProp<{ date: Date }>
}>

export function Calendar(rawProps: CalendarProps) {
  const [props, restProps] = prepareProps(
    rawProps,
    {
      month: new Date(),
    },
    ['min', 'max', 'onChangeMonth', 'style']
  )

  const monthSignal = createNormalizedSignalObject(
    props.month,
    () => clampMonth(props.min, props.month, props.max),
    props.onChangeMonth
  )

  const firstDateOfSelectedMonth = () => setDate(monthSignal.value, 1)
  const firstDateOfSelectedCalendar = () => subDays(firstDateOfSelectedMonth(), firstDateOfSelectedMonth().getDay())

  return (
    <div
      {...restProps}
      class={joinClasses(rawProps, 'solid-design-parts-Calendar_root')}
      style={joinStyle(props.style, {
        '--solid-design-parts-Calendar_year-month-order': i18n.literals.calendarYearMonthOrder,
      })}
    >
      <div class="solid-design-parts-Calendar_year-month-area">
        <IconButton
          class="solid-design-parts-Calendar_month-move-button solid-design-parts-Calendar_prev-month-button"
          aria-hidden={props.min !== undefined && isSameMonth(props.min, monthSignal.value)}
          src={chevronLeftIcon}
          onClick={() => (monthSignal.value = subMonths(monthSignal.value, 1))}
          size="1.6em"
        />
        <div class="solid-design-parts-Calendar_year-month">
          <span class="solid-design-parts-Calendar_year">
            {format(monthSignal.value, i18n.literals.calendarYearTemplate)}
          </span>
          <span class="solid-design-parts-Calendar_month">
            {format(monthSignal.value, i18n.literals.calendarMonthTemplate)}
          </span>
        </div>
        <IconButton
          class="solid-design-parts-Calendar_month-move-button solid-design-parts-Calendar_next-month-button"
          aria-hidden={props.max !== undefined && isSameMonth(monthSignal.value, props.max)}
          src={chevronRightIcon}
          onClick={() => (monthSignal.value = addMonths(monthSignal.value, 1))}
          size="1.6em"
        />
      </div>

      <div class="solid-design-parts-Calendar_grid">
        <div class="solid-design-parts-Calendar_day-row">
          <For each={i18n.literals.calendarDayNames}>
            {(dayName, day) => (
              <div class="solid-design-parts-Calendar_cell" data-day={day()}>
                {dayName}
              </div>
            )}
          </For>
        </div>

        <For each={rangeTo(6)}>
          {(weakIndex) => (
            <div class="solid-design-parts-Calendar_date-row">
              <For each={i18n.literals.calendarDayNames}>
                {(_, day) => {
                  const date = createMemoObject(() =>
                    addDays(addWeeks(firstDateOfSelectedCalendar(), weakIndex), day())
                  )
                  return (
                    <div
                      class="solid-design-parts-Calendar_cell"
                      classList={{
                        'solid-design-parts-Calendar_other-month': !isSameMonth(date.value, monthSignal.value),
                      }}
                      data-day={day()}
                    >
                      <Slot content={rawProps.children} params={{ date: date.value }}>
                        {date.value.getDate()}
                      </Slot>
                    </div>
                  )
                }}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

function clampMonth(min: Date | undefined, month: Date, max: Date | undefined): Date {
  if (min !== undefined) {
    if (max !== undefined) {
      return maxOf([min, minOf([month, max])])
    } else {
      return maxOf([min, month])
    }
  } else {
    if (max !== undefined) {
      return minOf([month, max])
    } else {
      return month
    }
  }
}