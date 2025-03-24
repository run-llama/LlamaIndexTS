import type { JSONSchemaType } from "ajv";
import { BaseTool, ToolMetadata } from "llamaindex";

interface GeoLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export type WeatherParameter = {
  location: string;
};

export type WeatherToolParams = {
  metadata?: ToolMetadata<JSONSchemaType<WeatherParameter>>;
};

const DEFAULT_META_DATA: ToolMetadata<JSONSchemaType<WeatherParameter>> = {
  name: "get_weather_information",
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
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The location to get the weather information",
      },
    },
    required: ["location"],
  },
};

export class WeatherTool implements BaseTool<WeatherParameter> {
  metadata: ToolMetadata<JSONSchemaType<WeatherParameter>>;

  private getGeoLocation = async (location: string): Promise<GeoLocation> => {
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const { id, name, latitude, longitude } = data.results[0];
    return { id, name, latitude, longitude };
  };

  private getWeatherByLocation = async (location: string) => {
    console.log(
      "Calling open-meteo api to get weather information of location:",
      location,
    );
    const { latitude, longitude } = await this.getGeoLocation(location);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code&timezone=${timezone}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  };

  constructor(params?: WeatherToolParams) {
    this.metadata = params?.metadata || DEFAULT_META_DATA;
  }

  async call(input: WeatherParameter) {
    return await this.getWeatherByLocation(input.location);
  }
}
