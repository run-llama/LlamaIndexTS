import { describe, expect, test } from "vitest";
import { weather } from "../src/tools/weather";

describe("Weather Tool", () => {
  test("weather tool returns data for valid location", async () => {
    const weatherTool = weather();
    const result = await weatherTool.call({
      location: "London",
    });

    expect(result).toHaveProperty("current");
    expect(result).toHaveProperty("hourly");
    expect(result).toHaveProperty("daily");
  });
});
