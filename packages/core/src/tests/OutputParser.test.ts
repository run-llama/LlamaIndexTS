import { SubQuestionOutputParser } from "../OutputParser";

describe("SubQuestionOutputParser", () => {
  test("parses expected",() => {
    //TODO: This is dummy code, fill this in...
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
    const full_string = 
`\`\`\`json
${data_str}
\`\`\``;

    const real_answer = {parsedOutput: data, rawOutput: full_string};
    
    expect(parser.parse(full_string)).toEqual(real_answer);
  });


  test("parses unexpected", ()=> {
    const parser = new SubQuestionOutputParser();
    const data_str = '[\n' +
    '    {\n' +
    `        "subQuestion": "Sorry, I don't have any relevant information to answer your question",\n` +
    '        "toolName": ""\n' +
    '    }\n' +
    ']';
    const data = [{subQuestion: "Sorry, I don't have any relevant information to answer your question",
                    toolName: ""}];
    const real_answer = {parsedOutput: data, rawOutput: data_str};
    expect(parser.parse(data_str)).toEqual(real_answer);
  });
});


