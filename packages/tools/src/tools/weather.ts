import { tool } from "@llamaindex/core/tools";
import * as z from "zod/v4";

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

export const weather = () => {
  return tool({
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
    execute: async ({ location }): Promise<WeatherToolOutput> => {
      return await getWeatherByLocation(location);
    },
  });
};

async function getWeatherByLocation(
  location: string,
): Promise<WeatherToolOutput> {
  const { latitude, longitude } = await getGeoLocation(location);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m,weather_code",
    hourly: "temperature_2m,weather_code",
    daily: "weather_code",
    timezone,
  });

  const apiUrl = `https://api.open-meteo.com/v1/forecast?${params}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Weather API request failed: ${response.statusText}`);
  }

  return (await response.json()) as WeatherToolOutput;
}

async function getGeoLocation(
  location: string,
): Promise<{ latitude: number; longitude: number }> {
  const params = new URLSearchParams({
    name: location,
    count: "10",
    language: "en",
    format: "json",
  });

  const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?${params}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Geocoding API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.results?.length) {
    throw new Error(`No location found for: ${location}`);
  }

  const { latitude, longitude } = data.results[0];
  return { latitude, longitude };
}
