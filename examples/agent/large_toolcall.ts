import { FunctionTool, OpenAI, OpenAIAgent } from "llamaindex";

const csvData =
  "TITLE,RELEASE_YEAR,SCORE,NUMBER_OF_VOTES,DURATION,MAIN_GENRE,MAIN_PRODUCTION\nDavid Attenborough: A Life on Our Planet,2020,9,31180,83,documentary,GB\nInception,2010,8.8,2268288,148,scifi,GB\nForrest Gump,1994,8.8,1994599,142,drama,US\nAnbe Sivam,2003,8.7,20595,160,comedy,IN\nBo Burnham: Inside,2021,8.7,44074,87,comedy,US\nSaving Private Ryan,1998,8.6,1346020,169,drama,US\nDjango Unchained,2012,8.4,1472668,165,western,US\nDangal,2016,8.4,180247,161,action,IN\nBo Burnham: Make Happy,2016,8.4,14356,60,comedy,US\nLouis C.K.: Hilarious,2010,8.4,11973,84,comedy,US\nDave Chappelle: Sticks & Stones,2019,8.4,25687,65,comedy,US\n3 Idiots,2009,8.4,385782,170,comedy,IN\nBlack Friday,2004,8.4,20611,143,crime,IN\nSuper Deluxe,2019,8.4,13680,176,thriller,IN\nWinter on Fire: Ukraine's Fight for Freedom,2015,8.3,17710,98,documentary,UA\nOnce Upon a Time in America,1984,8.3,342335,229,drama,US\nTaxi Driver,1976,8.3,795222,113,crime,US\nLike Stars on Earth,2007,8.3,188234,165,drama,IN\nBo Burnham: What.,2013,8.3,11488,60,comedy,US\nFull Metal Jacket,1987,8.3,723306,116,drama,GB\nWarrior,2011,8.2,463276,140,drama,US\nDrishyam,2015,8.2,79075,163,thriller,IN\nQueen,2014,8.2,64805,146,drama,IN\nPaan Singh Tomar,2012,8.2,35888,135,drama,IN";

const userQuestion = "which are the best comedies after 2010?";

(async () => {
  // The agent will succeed if we increase `maxTokens` to 1024
  const llm = new OpenAI({ model: "gpt-4-turbo", maxTokens: 256 });

  type Input = {
    code: string;
  };
  // initiate fake code interpreter
  const interpreterTool = FunctionTool.from<Input>(
    ({ code }) => {
      console.log(
        `To answer the user's question, call the following code:\n${code}`,
      );
      console.log("-----");
      return code;
    },
    {
      name: "interpreter",
      description:
        "Execute python code in a Jupyter notebook cell and return any result, stdout, stderr, display_data, and error.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The python code to execute in a single cell.",
          },
        },
        required: ["code"],
      },
    },
  );

  const systemPrompt =
    "You are a Python interpreter.\n        - You are given tasks to complete and you run python code to solve them.\n        - The python code runs in a Jupyter notebook. Every time you call $(interpreter) tool, the python code is executed in a separate cell. It's okay to make multiple calls to $(interpreter).\n        - Display visualizations using matplotlib or any other visualization library directly in the notebook. Shouldn't save the visualizations to a file, just return the base64 encoded data.\n        - You can install any pip package (if it exists) if you need to but the usual packages for data analysis are already preinstalled.\n        - You can run any python code you want in a secure environment.";

  const agent = new OpenAIAgent({
    llm,
    tools: [interpreterTool],
    systemPrompt,
    verbose: false,
  });

  console.log(`User question: ${userQuestion}\n`);

  const { response } = await agent.chat({
    message: [
      {
        type: "text",
        text: userQuestion,
      },
      {
        type: "text",
        text: `Use data from following CSV raw contents:\n${csvData}`,
      },
    ],
  });
  console.log("response:", response.message.content);
})();
