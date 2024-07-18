"use tool";
import { getCurrentStreamableUI } from "@/context";

export async function getMyUserID() {
  const ui = getCurrentStreamableUI()!;
  ui.update("Getting user ID...");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return "12345";
}

export async function showUserInfo(userId: string) {
  const ui = getCurrentStreamableUI()!;
  ui.update("Getting user info...");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  ui.update(
    <div>
      User ID: {userId}
      <br />
      Name: John Doe
    </div>,
  );
  return `User ID: ${userId}\nName: John Doe\nEmail: alex@gmail.com\nPhone: 123-456-7890\nAddress: 123 Main St\nCity: San Francisco\nState: CA\nZip: 94105\nCountry: USA\n`;
}

export function getWeather(address: string) {
  return `The weather in ${address} is sunny!`;
}
