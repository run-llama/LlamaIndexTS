import { execSync } from "child_process";
import ciInfo from "ci-info";
import fs from "fs";
import path from "path";
import { blue, green, red } from "picocolors";
import prompts from "prompts";
import { InstallAppArgs } from "./create-app";
import { TemplateFramework } from "./helpers";
import { COMMUNITY_OWNER, COMMUNITY_REPO } from "./helpers/constant";
import { getAvailableLlamapackOptions } from "./helpers/llama-pack";
import { getRepoRootFolders } from "./helpers/repo";

export type QuestionArgs = Omit<InstallAppArgs, "appPath" | "packageManager">;
const MACOS_FILE_SELECTION_SCRIPT = `
osascript -l JavaScript -e '
  a = Application.currentApplication();
  a.includeStandardAdditions = true;
  a.chooseFile({ withPrompt: "Please select a file to process:" }).toString()
'`;

const WINDOWS_FILE_SELECTION_SCRIPT = `
Add-Type -AssemblyName System.Windows.Forms
$openFileDialog = New-Object System.Windows.Forms.OpenFileDialog
$openFileDialog.InitialDirectory = [Environment]::GetFolderPath('Desktop')
$result = $openFileDialog.ShowDialog()
if ($result -eq 'OK') {
  $openFileDialog.FileName
}
`;

const defaults: QuestionArgs = {
  template: "streaming",
  framework: "nextjs",
  engine: "simple",
  ui: "html",
  eslint: true,
  frontend: false,
  openAiKey: "",
  model: "gpt-3.5-turbo",
  communityProjectPath: "",
  llamapack: "",
  postInstallAction: "dependencies",
};

const handlers = {
  onCancel: () => {
    console.error("Exiting.");
    process.exit(1);
  },
};

const getVectorDbChoices = (framework: TemplateFramework) => {
  const choices = [
    {
      title: "No, just store the data in the file system",
      value: "none",
    },
    { title: "MongoDB", value: "mongo" },
    { title: "PostgreSQL", value: "pg" },
  ];

  const vectordbLang = framework === "fastapi" ? "python" : "typescript";
  const compPath = path.join(__dirname, "..", "templates", "components");
  const vectordbPath = path.join(compPath, "vectordbs", vectordbLang);

  const availableChoices = fs
    .readdirSync(vectordbPath)
    .filter((file) => fs.statSync(path.join(vectordbPath, file)).isDirectory());

  const displayedChoices = choices.filter((choice) =>
    availableChoices.includes(choice.value),
  );

  return displayedChoices;
};

const selectPDFFile = async () => {
  // Popup to select a PDF file
  try {
    let selectedFilePath: string = "";
    switch (process.platform) {
      case "win32": // Windows
        selectedFilePath = execSync(WINDOWS_FILE_SELECTION_SCRIPT, {
          shell: "powershell.exe",
        })
          .toString()
          .trim();
        break;
      case "darwin": // MacOS
        selectedFilePath = execSync(MACOS_FILE_SELECTION_SCRIPT)
          .toString()
          .trim();
        break;
      default: // Unsupported OS
        console.log(red("Unsupported OS error!"));
        process.exit(1);
    }
    // Check is pdf file
    if (!selectedFilePath.endsWith(".pdf")) {
      console.log(
        red("Unsupported file error! Please select a valid PDF file!"),
      );
      process.exit(1);
    }
    return selectedFilePath;
  } catch (error) {
    console.log(
      red(
        "Got error when trying to select file! Please try again or select other options.",
      ),
    );
    process.exit(1);
  }
};

export const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

export const askQuestions = async (
  program: QuestionArgs,
  preferences: QuestionArgs,
) => {
  const getPrefOrDefault = <K extends keyof QuestionArgs>(
    field: K,
  ): QuestionArgs[K] => preferences[field] ?? defaults[field];

  // Ask for next action after installation
  async function askPostInstallAction() {
    if (program.postInstallAction === undefined) {
      if (ciInfo.isCI) {
        program.postInstallAction = getPrefOrDefault("postInstallAction");
      } else {
        let actionChoices = [
          {
            title: "Just generate code (~1 sec)",
            value: "none",
          },
          {
            title: "Generate code and install dependencies (~2 min)",
            value: "dependencies",
          },
        ];

        const hasOpenAiKey = program.openAiKey || process.env["OPENAI_API_KEY"];
        if (program.vectorDb === "none" && hasOpenAiKey) {
          actionChoices.push({
            title:
              "Generate code, install dependencies, and run the app (~2 min)",
            value: "runApp",
          });
        }

        const { action } = await prompts(
          {
            type: "select",
            name: "action",
            message: "How would you like to proceed?",
            choices: actionChoices,
            initial: 1,
          },
          handlers,
        );

        program.postInstallAction = action;
      }
    }
  }

  if (!program.template) {
    if (ciInfo.isCI) {
      program.template = getPrefOrDefault("template");
    } else {
      const styledRepo = blue(
        `https://github.com/${COMMUNITY_OWNER}/${COMMUNITY_REPO}`,
      );
      const { template } = await prompts(
        {
          type: "select",
          name: "template",
          message: "Which template would you like to use?",
          choices: [
            { title: "Chat without streaming", value: "simple" },
            { title: "Chat with streaming", value: "streaming" },
            {
              title: `Community template from ${styledRepo}`,
              value: "community",
            },
            {
              title: "Example using a LlamaPack",
              value: "llamapack",
            },
          ],
          initial: 1,
        },
        handlers,
      );
      program.template = template;
      preferences.template = template;
    }
  }

  if (program.template === "community") {
    const rootFolderNames = await getRepoRootFolders(
      COMMUNITY_OWNER,
      COMMUNITY_REPO,
    );
    const { communityProjectPath } = await prompts(
      {
        type: "select",
        name: "communityProjectPath",
        message: "Select community template",
        choices: rootFolderNames.map((name) => ({
          title: name,
          value: name,
        })),
        initial: 0,
      },
      handlers,
    );
    program.communityProjectPath = communityProjectPath;
    preferences.communityProjectPath = communityProjectPath;
    return; // early return - no further questions needed for community projects
  }

  if (program.template === "llamapack") {
    const availableLlamaPacks = await getAvailableLlamapackOptions();
    const { llamapack } = await prompts(
      {
        type: "select",
        name: "llamapack",
        message: "Select LlamaPack",
        choices: availableLlamaPacks.map((pack) => ({
          title: pack.name,
          value: pack.folderPath,
        })),
        initial: 0,
      },
      handlers,
    );
    program.llamapack = llamapack;
    preferences.llamapack = llamapack;
    await askPostInstallAction();
    return; // early return - no further questions needed for llamapack projects
  }

  if (!program.framework) {
    if (ciInfo.isCI) {
      program.framework = getPrefOrDefault("framework");
    } else {
      const choices = [
        { title: "Express", value: "express" },
        { title: "FastAPI (Python)", value: "fastapi" },
      ];
      if (program.template === "streaming") {
        // allow NextJS only for streaming template
        choices.unshift({ title: "NextJS", value: "nextjs" });
      }

      const { framework } = await prompts(
        {
          type: "select",
          name: "framework",
          message: "Which framework would you like to use?",
          choices,
          initial: 0,
        },
        handlers,
      );
      program.framework = framework;
      preferences.framework = framework;
    }
  }

  if (
    program.template === "streaming" &&
    (program.framework === "express" || program.framework === "fastapi")
  ) {
    // if a backend-only framework is selected, ask whether we should create a frontend
    // (only for streaming backends)
    if (program.frontend === undefined) {
      if (ciInfo.isCI) {
        program.frontend = getPrefOrDefault("frontend");
      } else {
        const styledNextJS = blue("NextJS");
        const styledBackend = green(
          program.framework === "express"
            ? "Express "
            : program.framework === "fastapi"
              ? "FastAPI (Python) "
              : "",
        );
        const { frontend } = await prompts({
          onState: onPromptState,
          type: "toggle",
          name: "frontend",
          message: `Would you like to generate a ${styledNextJS} frontend for your ${styledBackend}backend?`,
          initial: getPrefOrDefault("frontend"),
          active: "Yes",
          inactive: "No",
        });
        program.frontend = Boolean(frontend);
        preferences.frontend = Boolean(frontend);
      }
    }
  } else {
    program.frontend = false;
  }

  if (program.framework === "nextjs" || program.frontend) {
    if (!program.ui) {
      if (ciInfo.isCI) {
        program.ui = getPrefOrDefault("ui");
      } else {
        const { ui } = await prompts(
          {
            type: "select",
            name: "ui",
            message: "Which UI would you like to use?",
            choices: [
              { title: "Just HTML", value: "html" },
              { title: "Shadcn", value: "shadcn" },
            ],
            initial: 0,
          },
          handlers,
        );
        program.ui = ui;
        preferences.ui = ui;
      }
    }
  }

  if (!program.model) {
    if (ciInfo.isCI) {
      program.model = getPrefOrDefault("model");
    } else {
      const { model } = await prompts(
        {
          type: "select",
          name: "model",
          message: "Which model would you like to use?",
          choices: [
            { title: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
            { title: "gpt-4", value: "gpt-4" },
            { title: "gpt-4-1106-preview", value: "gpt-4-1106-preview" },
            {
              title: "gpt-4-vision-preview",
              value: "gpt-4-vision-preview",
            },
          ],
          initial: 0,
        },
        handlers,
      );
      program.model = model;
      preferences.model = model;
    }
  }

  if (!program.engine) {
    if (ciInfo.isCI) {
      program.engine = getPrefOrDefault("engine");
    } else {
      let choices = [
        {
          title: "No data, just a simple chat",
          value: "simple",
        },
        { title: "Use an example PDF", value: "exampleFile" },
      ];
      if (process.platform === "win32" || process.platform === "darwin") {
        choices.push({ title: "Use a local PDF file", value: "localFile" });
      }

      const { dataSource } = await prompts(
        {
          type: "select",
          name: "dataSource",
          message: "Which data source would you like to use?",
          choices: choices,
          initial: 1,
        },
        handlers,
      );
      switch (dataSource) {
        case "simple":
          program.engine = "simple";
          break;
        case "exampleFile":
          program.engine = "context";
          break;
        case "localFile":
          program.engine = "context";
          // If the user selected the "pdf" option, ask them to select a file
          program.contextFile = await selectPDFFile();
          break;
      }
    }
    if (program.engine !== "simple" && !program.vectorDb) {
      if (ciInfo.isCI) {
        program.vectorDb = getPrefOrDefault("vectorDb");
      } else {
        const { vectorDb } = await prompts(
          {
            type: "select",
            name: "vectorDb",
            message: "Would you like to use a vector database?",
            choices: getVectorDbChoices(program.framework),
            initial: 0,
          },
          handlers,
        );
        program.vectorDb = vectorDb;
        preferences.vectorDb = vectorDb;
      }
    }
  }

  if (!program.openAiKey) {
    const { key } = await prompts(
      {
        type: "text",
        name: "key",
        message: "Please provide your OpenAI API key (leave blank to skip):",
      },
      handlers,
    );
    program.openAiKey = key;
    preferences.openAiKey = key;
  }

  if (program.framework !== "fastapi" && program.eslint === undefined) {
    if (ciInfo.isCI) {
      program.eslint = getPrefOrDefault("eslint");
    } else {
      const styledEslint = blue("ESLint");
      const { eslint } = await prompts({
        onState: onPromptState,
        type: "toggle",
        name: "eslint",
        message: `Would you like to use ${styledEslint}?`,
        initial: getPrefOrDefault("eslint"),
        active: "Yes",
        inactive: "No",
      });
      program.eslint = Boolean(eslint);
      preferences.eslint = Boolean(eslint);
    }
  }

  await askPostInstallAction();

  // TODO: consider using zod to validate the input (doesn't work like this as not every option is required)
  // templateUISchema.parse(program.ui);
  // templateEngineSchema.parse(program.engine);
  // templateFrameworkSchema.parse(program.framework);
  // templateTypeSchema.parse(program.template);``
};
