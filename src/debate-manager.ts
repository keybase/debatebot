import Bot from 'keybase-bot'
import {MsgSummary, ChatChannel} from 'keybase-bot/lib/types/chat1'
import {sendAndLog, timeout, arrayShuffleNew, log} from './utils'
import config from './config'

//
// This class manages debates. It keeps track of debate requests,
// and when enough comes in, it starts a conversation with those people.
//

type Party = string[]

class AdventureManager {
  private bot: Bot
  private waitingRoom: Party
  private lastDebateRequest: Map<string, Date>
  public constructor(bot: Bot) {
    this.bot = bot
    this.waitingRoom = []
    this.lastDebateRequest = new Map()
  }

  public async handleDebateRequest(sender: string, message: MsgSummary) {
    const channel = message.channel
    if (this.waitingRoom.includes(sender)) {
      await sendAndLog(this.bot, channel, 'Hang tight. Let me find some other friendly folks.')
    } else {
      if (this.isTooEarlyForUser(sender)) {
        await sendAndLog(
          this.bot,
          channel,
          'Sorry - you must wait 15 minutes from your last debate request. If the earth is even around then.',
        )
      } else {
        this.waitingRoom.push(sender)

        if (this.waitingRoom.length >= config.partySize) {
          const party = arrayShuffleNew(this.waitingRoom)
          this.waitingRoom = []
          this.startGloriousDebate(party)
          await sendAndLog(this.bot, channel, 'Oh, exciting. I have found debate partners for you.')
        } else {
          await sendAndLog(this.bot, channel, 'Ok, debate requested. Let me find a few other...feisty people to join you.')
        }
      }
    }
  }

  private isTooEarlyForUser(sender: string) {
    const d = this.lastDebateRequest.get(sender)
    if (d && d.getTime() > Date.now() - config.userLobbyWaitMs) return true
    this.lastDebateRequest.set(sender, new Date())
    return false
  }

  private async startGloriousDebate(party: string[]) {
    log.info(`Starting debate with ${party.join(',')}`)
    const channel: ChatChannel = {name: party.join(',')}
    this.waitingRoom = []
    await this.bot.chat.send(channel, {body: this.getWelcomeText(party)})
    await timeout(config.creativeLeadDelay)
    const leader = party[0]
    const body = this.getLeaderAnnouncementText(leader)
    await this.bot.chat.send(channel, {body})
    this.sendAdviceToStoryMaster(leader)
  }

  private getLeaderAnnouncementText(leader: string) {
    return `I choose: **${leader}**. Yes!  **You** must pick a topic. (Everyone else: give **${leader}** up to ten minutes. Meantime, keep getting to know each other before mutiny. I'm sending a private message to **${leader}** now.)`
  }

  private headerBar() {
    // just a random mix of happy images (hearts) and
    // controversial images (religion, science, weapons, money)
    // let's get the juices flowing PEOPLE
    return ':heart: :heart: :kissing_heart: :angel: :earth_africa: :moneybag: :rainbow: :gun: :hocho: :school: :boxing_glove: :atom_symbol: :latin_cross: :star_of_david: :star_and_crescent: :wheel_of_dharma: :recycle: :sos: :heart: :heart:'
  }

  private getWelcomeText(party: string[]) {
    return `
${this.headerBar()}

Hi! All ${
      party.length
    } of you are ripe and ready for an honest debate. But my debate comes with a twist: one of YOU must pick the topic. And the other ${party.length -
      1} must discuss it. While staying civil of course.

Some rules: /keybase/public/debatebot/debating.txt

Take a peek, make friends with each other, and in about three minutes, I'll flip myself a coin and choose the _creative lead_.

${this.headerBar()}

`
  }

  private async sendAdviceToStoryMaster(username: string) {
    const channel: ChatChannel = {name: username}
    await this.bot.chat.send(channel, {
      body: `@${username}, you are the creative lead! You have one big responsibility, which is to pose a _question_ of some kind in that other channel.

If you need help formulating a question, here are some random websites with controversial topics:

* https://owlcation.com/academia/100-Debate-Topics
* https://www.procon.org/debate-topics.php
* https://papersowl.com/blog/35-best-debate-topics-for-students

Or, even better, just pose your _own_ question in that chat. Or share an article you found interesting.

Take up to ten minutes to think about it.

:heart: Good luck.
      `,
    })
  }
}

export default AdventureManager
