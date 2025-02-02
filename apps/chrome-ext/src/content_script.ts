import type { BaseConverter } from './converters/base'
import { ChatGPTConverter } from './converters/chatgpt/convert'
import { ClaudeConverter } from './converters/claude/convert'
import { ShareGPTConverter } from './converters/sharegpt/convert'


import type { ConvertInstructionRequest, ConvertInstructions, ConvertResult } from './schema'

const ConvertLists: BaseConverter[] = [new ChatGPTConverter(), new ShareGPTConverter(), new ClaudeConverter()]

const tryConvert = (command: ConvertInstructions): ConvertResult => {
  try {
    for (const converter of ConvertLists) {

      if (converter.isActive) {
        console.log('converter: ', converter, 'command: ', command)
        const content = command === 'CONVERT' ? converter.convert() : converter.currentFileName
        return {
          success: true,
          content,
        }
      }
    }
  } catch (e) {
    return {
      success: false,
      error: `${e}`,
    }
  }

  return {
    success: false,
    error: 'no convert found',
  }
}

// get popup2content info
chrome.runtime.onMessage.addListener((request: ConvertInstructionRequest, sender, sendResponse) => {
  const convertResult = tryConvert(request.command)
  sendResponse({
    result: convertResult,
  })
})
