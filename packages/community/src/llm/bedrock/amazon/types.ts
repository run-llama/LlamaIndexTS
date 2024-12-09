import type { ConverseRequest, Message } from "@aws-sdk/client-bedrock-runtime";

export type AmazonMessages = ConverseRequest["messages"];

export type AmazonMessage = Message;
