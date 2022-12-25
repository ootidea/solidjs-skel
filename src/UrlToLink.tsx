import { chunk, rangeTo } from 'base-up'
import { JSX } from 'solid-js'
import css from './UrlToLink.scss'
import { joinClasses, prepareProps, Props } from './utility/props'
import { registerCss } from './utility/registerCss'

registerCss(css)

export type UrlToLinkProps = Props<{
  children?: string
  link?: (url: string) => JSX.Element
}>

export function UrlToLink(rawProps: UrlToLinkProps) {
  const [props, restProps] = prepareProps(rawProps, { children: '', link: (url) => <a href={url}>{url}</a> })

  const regexp = /([a-zA-Z]{2,20}):\/\/([\w_-]+(?:(?:\.[\w_-]+)?))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g

  const urls: string[] = []
  const indexes = [0]
  for (const regExpMatchArray of props.children.matchAll(regexp)) {
    if (regExpMatchArray.index !== undefined) {
      indexes.push(regExpMatchArray.index, regExpMatchArray.index + regExpMatchArray[0].length)
      urls.push(regExpMatchArray[0])
    }
  }
  indexes.push(props.children.length)

  const texts = chunk(indexes, 2).map(([start, end]) => props.children.substring(start, end))

  return (
    <div class={joinClasses(rawProps, 'mantle-ui-UrlToLink_root')} {...restProps}>
      {rangeTo(texts.length).map((i) => (
        <>
          {texts[i]}
          {i < urls.length && props.link(urls[i])}
        </>
      ))}
    </div>
  )
}
