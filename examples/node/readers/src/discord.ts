import { DiscordReader } from "llamaindex";

async function main() {
  // Create an instance of the DiscordReader. Set token here or DISCORD_TOKEN environment variable
  const discordReader = new DiscordReader();

  // Specify the channel IDs you want to read messages from as an arry of strings
  const channelIds = ["721374320794009630", "719596376261918720"];

  // Specify the number of messages to fetch per channel
  const limit = 10;

  // Load messages from the specified channel
  const messages = await discordReader.loadData(channelIds, limit, true);

  // Print out the messages
  console.log(messages);
}

main().catch(console.error);
