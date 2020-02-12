import Bot from 'keybase-bot'
import config from './config'
import {log, logMessage, isOneOnOneMessage, sendAndLog, trimMessage, timeout} from './utils'
import {MsgSummary} from 'keybase-bot/lib/types/chat1'
import DebateManager from './debate-manager'

type Stats = {
  whenStarted: number
  usersTalkedTo: Set<string>
  messagesReceived: number
}
class Runner {
  public bot: Bot
  private stats: Stats
  private debateManager: DebateManager
  public constructor() {
    this.stats = {
      whenStarted: Date.now(),
      usersTalkedTo: new Set(),
      messagesReceived: 0,
    }
    this.bot = new Bot({debugLogging: true})
    this.debateManager = new DebateManager(this.bot)
  }

  public async init() {
    await this.bot.init(config.sender, config.paperkey)
    this.announceCommandsIUnderstand()
    this.listenForEverything()
  }

  private async announceCommandsIUnderstand() {
    await this.bot.chat.advertiseCommands({
      advertisements: [
        {
          type: 'public',
          commands: [
            {
              name: 'debate',
              description: 'Ask me to find you random partners.',
              usage: '',
            },
            {
              name: 'stats',
              description: 'Ask me about my own situation.',
              usage: '',
            },
            {
              name: 'shutdown',
              description: 'Ask me to die.',
              usage: '',
            },
            {
              name: 'sourcecode',
              description: 'See how I was programmed. Maybe even clone me.',
              usage: '',
            },
          ],
        },
      ],
    })
  }

  private async handleMessage(message: MsgSummary) {
    // Sometimes users forget the exclamation point, so I'll
    // strip out all that and lowercase/trim the message
    const isDm = isOneOnOneMessage(message)
    const text = trimMessage(message)
    const sender = message.sender?.username
    const c = message.channel
    const b = this.bot
    if (sender) {
      this.stats.messagesReceived++
      this.stats.usersTalkedTo.add(sender)
      switch (text) {
        case '!debate':
          if (isDm) this.debateManager.handleDebateRequest(sender, message)
          else sendAndLog(b, c, `Please message me privately for that, @${sender}.`)
          break
        case '!stats':
          sendAndLog(b, c, this.getStatsString())
          break
        case '!shutdown':
          this.tryToShutdown(sender, message)
          break
        case '!sourcecode':
          sendAndLog(
            b,
            c,
            `You can make a bot just like me. You are never too small to make a difference. https://github.com/keybase/debatebot`,
          )
          break
        default:
          if (isDm) sendAndLog(b, c, 'I understand just a few commands. Start typing with `!` to see them')
      }
    }
  }

  private async tryToShutdown(sender: string, message: MsgSummary) {
    if (config.botMasters.includes(sender)) {
      sendAndLog(this.bot, message.channel, 'Ok...shutting down in 10 seconds')
      await timeout(10 * 1000)
      await this.deinitAndQuit(0)
    } else {
      sendAndLog(this.bot, message.channel, `How dare you.`)
    }
  }

  private getStatsString() {
    const dt = (Date.now() - this.stats.whenStarted).toLocaleString() // adds commas
    const messages = this.stats.messagesReceived
    const users = this.stats.usersTalkedTo.size
    return `I've been alive for ${dt} milliseconds and read ${messages} messages from ${users} people. While you are stealing your children's future in front of their very eyes.`
  }

  private listenForEverything() {
    const onMessage = async (message: MsgSummary) => {
      if (config.ignoreTeams.includes(message.channel.name)) {
        return
      }
      logMessage(message, !isOneOnOneMessage(message))
      this.handleMessage(message)
    }
    this.bot.chat.watchAllChannelsForNewMessages(onMessage)
    log.info('Listening')
  }

  public async deinitAndQuit(exitCode: number) {
    log.info('Deinitializing...')
    await this.bot.deinit()
    log.info('Shutting down...')
    process.exit(exitCode)
  }
}

async function main() {
  const runner = new Runner()
  log.info(`Initializing as ${config.sender}...`)
  await runner.init()
  log.info('...initialized!')
}

// --------------------------------------------------------------------------------------------------

main()
