import secrets from './secrets'

export default {
  sender: secrets.sender,
  paperkey: secrets.paperkey,
  partySize: 5, // one creative lead, so approximately (N-1)/2 on each side
  userLobbyWaitMs: 1000 * 60 * 15, // delay before users can ask for a 2nd debate
  creativeLeadDelay: 1000 * 60 * 3, // how long before a leader is chosen

  // I like to make my bots refuse to go into an infinite loop with other bots.
  infiniteLoopThreshhold: 1000, // if a user sends this many messages stop listening during loop time
  infiniteLoopTime: 1000 * 3600 * 4, // 4 hours

  // Teams we just don't even want to look at messages in
  ignoreTeams: ['keybasefriends', 'stellar.public'],

  // Keybase users who can kill the bot with a chat command
  botMasters: ['chris', 'mikem', 'max', 'patrick'],
}
