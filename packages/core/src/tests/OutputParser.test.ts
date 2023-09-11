import { SubQuestionOutputParser } from "../OutputParser";

//This parser is really important, so make sure to add tests
// as the parser sees through more iterations.
describe("SubQuestionOutputParser", () => {
  test("parses expected", () => {
    const parser = new SubQuestionOutputParser();

    const data = [
      {
        name: "uber_10k",
        description: "Provides information about Uber financials for year 2021",
      },
      {
        name: "lyft_10k",
        description: "Provides information about Lyft financials for year 2021",
      },
    ];

    const data_str: string = JSON.stringify(data);
    const full_string = `\`\`\`json
${data_str}
\`\`\``;

    const real_answer = { parsedOutput: data, rawOutput: full_string };

    expect(parser.parse(full_string)).toEqual(real_answer);
  });

  //This is in case our LLM outputs a list response, but without ```json.
  test("parses without ```json", () => {
    const parser = new SubQuestionOutputParser();

    const data = [
      {
        name: "uber_10k",
        description: "Provides information about Uber financials for year 2021",
      },
      {
        name: "lyft_10k",
        description: "Provides information about Lyft financials for year 2021",
      },
    ];

    const data_str: string = JSON.stringify(data);
    const full_string = `${data_str}`;

    const real_answer = { parsedOutput: data, rawOutput: full_string };

    expect(parser.parse(JSON.stringify(data))).toEqual(real_answer);
  });
});
