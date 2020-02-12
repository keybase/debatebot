# debatebot

[@debatebot](https://keybase.io/debatebot) on Keybase introduces strangers, for friendly discussions on controversial topics. This bot is written in TypeScript and serves as a basic example of bot-writing on Keybase. 

It announces commands (`!debate`) in chat. For example:

![advertised commands](https://github.com/keybase/debatebot/raw/master/images/advertised-commands.png)

And the bot replies:

![reply](https://github.com/keybase/debatebot/raw/master/images/reply.png)

If you'd like to write your _own_ Keybase bot, **debatebot** is a good starting point. You can fork it.

### To run it, or your edits of it:

1. Clone this repo to your own computer.
2. Run `yarn` (what I use) or `npm install` (more common) to install requirements
3. copy `src/secrets.example.ts` to `src/secrets.ts` and put a real username and paperkey in there.
4. run `yarn go` or `npm run go` to start it up.

That should be it. You can then send your bot a message

### Getting started on changing it

take a look at `src/main.ts`. You can strip that down to the most basic bot if you like.
