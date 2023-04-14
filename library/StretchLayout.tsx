import './common.scss'
import './StretchLayout.scss'
import { toArray } from './utility/dom'
import { joinClasses, joinStyle, prepareProps, Props } from './utility/props'

export type StretchLayoutProps = Props<{
  stretchAt?: number | `${number}`
  direction?: 'horizontal' | 'vertical'
}>

export function StretchLayout(rawProps: StretchLayoutProps) {
  const [props, restProps] = prepareProps(
    rawProps,
    {
      stretchAt: 0,
      direction: 'horizontal',
    },
    ['style']
  )

  function normalizeIndex(index: number) {
    if (index >= 0) {
      return index
    }

    return toArray(rawProps.children).length + index
  }

  return (
    <div
      {...restProps}
      class={joinClasses(rawProps, 'solid-design-parts-StretchLayout_root')}
      style={joinStyle(rawProps.style, {
        '--solid-design-parts-StretchLayout_template':
          'auto '.repeat(normalizeIndex(Number(props.stretchAt))) + 'minmax(0, 1fr)',
      })}
      data-direction={props.direction}
    >
      {rawProps.children}
    </div>
  )
}