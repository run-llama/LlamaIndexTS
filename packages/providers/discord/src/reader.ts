import { REST, type RESTOptions } from "@discordjs/rest";
import { Document, type BaseReader } from "@llamaindex/core/schema";
import { getEnv } from "@llamaindex/env";
import { Routes, type APIEmbed, type APIMessage } from "discord-api-types/v10";

/**
 * Represents a reader for Discord messages using @discordjs/rest
 * See https://github.com/discordjs/discord.js/tree/main/packages/rest
 */
export class DiscordReader implements BaseReader {
  private client: REST;

  constructor(
    discordToken?: string,
    requestHandler?: RESTOptions["makeRequest"],
  ) {
    const token = discordToken ?? getEnv("DISCORD_TOKEN");
    if (!token) {
      throw new Error(
        "Must specify `discordToken` or set environment variable `DISCORD_TOKEN`.",
      );
    }

    const restOptions: Partial<RESTOptions> = { version: "10" };

    // Use the provided request handler if specified
    if (requestHandler) {
      restOptions.makeRequest = requestHandler;
    }

    this.client = new REST(restOptions).setToken(token);
  }

  // Read all messages in a channel given a channel ID
  private async readChannel(
    channelId: string,
    limit?: number,
    additionalInfo?: boolean,
    oldestFirst?: boolean,
  ): Promise<Document[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (oldestFirst) params.append("after", "0");

    try {
      const endpoint =
        `${Routes.channelMessages(channelId)}?${params}` as `/channels/${string}/messages`;
      const messages = (await this.client.get(endpoint)) as APIMessage[];
      return messages.map((msg) =>
        this.createDocumentFromMessage(msg, additionalInfo),
      );
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  private createDocumentFromMessage(
    msg: APIMessage,
    additionalInfo?: boolean,
  ): Document {
    let content = msg.content || "";

    // Include information from embedded messages
    if (additionalInfo && msg.embeds.length > 0) {
      content +=
        "\n" + msg.embeds.map((embed) => this.embedToString(embed)).join("\n");
    }

    // Include URL from attachments
    if (additionalInfo && msg.attachments.length > 0) {
      content +=
        "\n" +
        msg.attachments
          .map((attachment) => `Attachment: ${attachment.url}`)
          .join("\n");
    }

    return new Document({
      text: content,
      id_: msg.id,
      metadata: {
        messageId: msg.id,
        username: msg.author.username,
        createdAt: new Date(msg.timestamp).toISOString(),
        editedAt: msg.edited_timestamp
          ? new Date(msg.edited_timestamp).toISOString()
          : undefined,
      },
    });
  }

  // Create a string representation of an embedded message
  private embedToString(embed: APIEmbed): string {
    let result = "***Embedded Message***\n";
    if (embed.title) result += `**${embed.title}**\n`;
    if (embed.description) result += `${embed.description}\n`;
    if (embed.url) result += `${embed.url}\n`;
    if (embed.fields) {
      result += embed.fields
        .map((field) => `**${field.name}**: ${field.value}`)
        .join("\n");
    }
    return result.trim();
  }

  /**
   * Loads messages from multiple discord channels and returns an array of Document Objects.
   *
   * @param {string[]} channelIds - An array of channel IDs from which to load data.
   * @param {number} [limit] - An optional limit on the number of messages to load per channel.
   * @param {boolean} [additionalInfo] - An optional flag to include content from embedded messages and attachments urls as text.
   * @param {boolean} [oldestFirst] - An optional flag to load oldest messages first.
   * @return {Promise<Document[]>} A promise that resolves to an array of loaded documents.
   */
  async loadData(
    channelIds: string[],
    limit?: number,
    additionalInfo?: boolean,
    oldestFirst?: boolean,
  ): Promise<Document[]> {
    let results: Document[] = [];
    for (const channelId of channelIds) {
      if (typeof channelId !== "string") {
        throw new Error(`Channel id ${channelId} must be a string.`);
      }
      const channelDocuments = await this.readChannel(
        channelId,
        limit,
        additionalInfo,
        oldestFirst,
      );
      results = results.concat(channelDocuments);
    }
    return results;
  }
}
