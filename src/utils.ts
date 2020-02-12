import Bot from 'keybase-bot'
import {ChatChannel, MsgSummary} from 'keybase-bot/lib/types/chat1'
import config from './config'

export function timeout(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export const log = {
  info: function(s: string) {
    console.log(new Date(), `[I] ${s}`)
  },
  error: function(s: string) {
    console.log(new Date(), `[E] ${s}`)
  },
}

function leftPad(s: string, n: number) {
  let res = s
  while (res.length < n) {
    res = res + ' '
  }
  return res
}

export function channelToString(channel: ChatChannel) {
  if (channel.membersType === 'team') {
    return `${channel.name}#${channel.topicName}`
  } else {
    // exclude self from partner list
    return channel.name
      .split(',')
      .filter(u => u !== config.sender)
      .join(',')
  }
}

export function logOutgoingMessage(channel: ChatChannel, body: string) {
  const col1 = leftPad(`[${channelToString(channel)}]`, 30)
  const col2 = leftPad(config.sender, 16)
  const col3 = body
    .replace(/[\n\r]/g, ' ')
    .trim()
    .substr(0, 120)
  log.info(`${col1} ${col2} ${col3}`)
}

export function isOneOnOneMessage(message: MsgSummary) {
  return !!(
    message.content.text &&
    message.content.type === 'text' &&
    message.channel.membersType === 'impteamnative' &&
    message.channel.name.split(',').length === 2
  )
}

export function logMessage(message: MsgSummary, redact?: boolean) {
  const msgTrimmed = message.content.text
    ? message.content.text.body
        .replace(/[\n\r]/g, ' ')
        .trim()
        .substr(0, 120)
    : ''
  const col1 = leftPad(`[${channelToString(message.channel)}`, 30).slice(0, 30) + '...]'
  const col2 = leftPad(message.sender.username || '', 16)
  const col3 = redact ? msgTrimmed.replace(/[^.?\-,!\s]/g, '*') : msgTrimmed
  log.info(`${col1} ${col2} ${col3}`)
}

export function randomText(texts: string[]) {
  return texts[Math.floor(Math.random() * texts.length)]
}

export function trimMessage(message: MsgSummary) {
  // trim whitespace and lowercases it
  return (message.content.text || {body: ''}).body.trim().toLowerCase()
}

export async function sendAndLog(bot: Bot, channel: ChatChannel, body: string) {
  bot.chat.send(channel, {body})
  logOutgoingMessage(channel, body)
}

export function arrayShuffleInPlace<T>(a: T[]): T[] {
  let i = a.length
  while (--i > 0) {
    const j = ~~(Math.random() * (i + 1))
    const t = a[j]
    a[j] = a[i]
    a[i] = t
  }
  return a
}

export function arrayShuffleNew<T>(a: T[]): T[] {
  return arrayShuffleInPlace(Array.from(a))
}
