/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error ignore type
import TurndownService from 'turndown/lib/turndown.es.js'
// @ts-ignore
import { gfm } from 'turndown-plugin-gfm'
import { BaseConverter } from '../base'

const turndownService = new TurndownService({
  preformattedCode: true,
  codeBlockStyle: 'fenced',
})

turndownService.use(gfm);

export class ClaudeConverter extends BaseConverter {
  override get isActive() {
    return /claude.ai/.test(window.location.href)
  }

  override get currentFileName() {
    const titlesContainer = document.querySelector('[id^="radix-"]')
    console.log(titlesContainer)

    try {
      return (titlesContainer as HTMLDivElement)?.innerText
        ? `(claude)-${(titlesContainer as HTMLDivElement)?.innerText}.md`
        : ''
    } catch (e) {
      console.log(e)
      // do nothing
    }
    console.log('return empty string')
    return ''
  }

  convert(): string {
    const threadContainer = document.querySelector(
      'div.flex.relative.mx-auto.h-screen div.gap-x-2.gap-y-3',
    )
    console.log(threadContainer)
    let res = ''
    for (const childNode of threadContainer!.childNodes) {
      // ignore unexpected: 查询子元素 div 是否包含 place-self-end
      if (!childNode.childNodes.length) continue
      const questionContainer = childNode instanceof HTMLElement ? childNode.querySelector('div.place-self-end') : null;
      const answerContainer = childNode instanceof HTMLElement ? childNode.querySelector('div.place-self-start') : null;

      if (!questionContainer && !answerContainer) continue;


      // 根据 questionContainer 是否为 null 判断是否是问答
      const isQ = questionContainer ? true : false;
      let textNode: HTMLDivElement | undefined;
      if (isQ) {
        textNode = questionContainer?.childNodes[0] as HTMLDivElement;
      } else {
        textNode = answerContainer?.childNodes[0] as HTMLDivElement;
      }
      console.log('textNode: ', textNode)
      res += isQ ? `Q: ` : 'A: '
      console.log("textNode.innerHTML: ", textNode.innerHTML)
      // Make sure code follows pre so that turndown can handle multiple lines of code
      const formattedHTML = textNode.innerHTML.replace(
        /<pre([\s\S]*?)<code([\s\S]*?)<\/code>([\s\S]*?)<\/pre>/g,
        '<pre><code$2</code></pre>',
      )
      console.log("isQ:, ", isQ, "formattedHTML: ", formattedHTML)

      const markdown = turndownService.turndown(formattedHTML)

      console.log
      res += markdown
      res += `\n\n---\n\n`
    }
    console.log("res: ", res)
    return res
  }
}
