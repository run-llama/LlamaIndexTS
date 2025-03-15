import { tool } from "@llamaindex/core/tools";
import { z } from "zod";

export type WeatherToolOutput = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    weather_code: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    weather_code: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    weather_code: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily_units: {
    time: string;
    weather_code: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
  };
};

export const weather = tool({
  name: "weather",
  description: `
    Use this function to get the weather of any given location.
    Note that the weather code should follow WMO Weather interpretation codes (WW):
    0: Clear sky
    1, 2, 3: Mainly clear, partly cloudy, and overcast
    45, 48: Fog and depositing rime fog
    51, 53, 55: Drizzle: Light, moderate, and dense intensity
    56, 57: Freezing Drizzle: Light and dense intensity
    61, 63, 65: Rain: Slight, moderate and heavy intensity
    66, 67: Freezing Rain: Light and heavy intensity
    71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
    77: Snow grains
    80, 81, 82: Rain showers: Slight, moderate, and violent
    85, 86: Snow showers slight and heavy
    95: Thunderstorm: Slight or moderate
    96, 99: Thunderstorm with slight and heavy hail
  `,
  parameters: z.object({
    location: z.string().describe("The location to get the weather"),
  }),
  execute: async ({
    location,
  }: {
    location: string;
  }): Promise<WeatherToolOutput> => {
    return await getWeatherByLocation(location);
  },
});

async function getWeatherByLocation(location: string) {
  const { latitude, longitude } = await getGeoLocation(location);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code&timezone=${timezone}`;
  const response = await fetch(apiUrl);
  const data = (await response.json()) as WeatherToolOutput;
  return data;
}

async function getGeoLocation(
  location: string,
): Promise<{ latitude: number; longitude: number }> {
  const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  const { latitude, longitude } = data.results[0];
  return { latitude, longitude };
}
