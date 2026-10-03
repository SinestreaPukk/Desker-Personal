import { messagingApi } from "@line/bot-sdk";

export const line = new messagingApi.MessagingApiClient({ channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "" });
export const lineEnabled = () => Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN);
