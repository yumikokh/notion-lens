import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { NotionReflector } from "..";
import { readCache, writeCache } from "../helpers/cache";
import { ENVS } from "./env";
import { NotionSerializer } from "../NotionSerializer";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const getPromptConfigFromFile = () => {
  const promptConfigPath = path.resolve(__dirname, "../../prompt/config.json");

  if (!fs.existsSync(promptConfigPath)) {
    console.error(`Prompt configuration file not found: ${promptConfigPath}.

Please run the prompt command first.
$ notion-lens prompt

`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(promptConfigPath, "utf-8"));

  return {
    summaryCategories: config.summaryCategories,
    reflectionGoals: config.reflectionGoals,
  };
};

export interface RunOptions {
  database?: string;
  from?: string;
  to?: string;
  output?: string;
  force?: boolean;
  dryRun?: boolean;
}

export const run = async (opts: RunOptions) => {
  const openaiApiKey = process.env[ENVS.OPENAI_API_KEY];
  const notionApiKey = process.env[ENVS.NOTION_API_TOKEN];
  const databaseId =
    typeof opts.database === "string"
      ? opts.database
      : process.env[ENVS.NOTION_DATABASE_ID];
  const outputPath = opts.output ? opts.output : undefined;

  if (!openaiApiKey && !opts.dryRun) {
    console.error("OPENAI_API_KEY is not set");
    process.exit(1);
  }

  if (!notionApiKey) {
    console.error("NOTION_API_TOKEN is not set");
    process.exit(1);
  }

  if (!databaseId) {
    console.error(
      "databaseId is not set. Please set the environment variable NOTION_DATABASE_ID or use the --database option."
    );
    process.exit(1);
  }

  if (opts.dryRun) {
    const notionContents = await new NotionSerializer({
      apiKey: notionApiKey,
      databaseId,
      cache: {
        readCache,
        writeCache,
      },
    }).getNotionContents({
      from: opts.from ? new Date(opts.from) : undefined,
      to: opts.to ? new Date(opts.to) : undefined,
      force: opts.force,
    });

    if (outputPath) {
      fs.writeFileSync(outputPath, notionContents);
      console.log(`Output to ${opts.output}`);
      process.exit(0);
    }
    console.log(notionContents);
    process.exit(0);
  }

  const { summaryCategories, reflectionGoals } = getPromptConfigFromFile();
  const evaluator = new NotionReflector({
    config: {
      openAiApiKey: openaiApiKey as string /* enable undefined when dry-run */,
      notionApiKey: notionApiKey,
    },
    databaseId,
    promptConfig: {
      summaryCategories,
      reflectionGoals,
      cache: {
        readCache,
        writeCache,
      },
    },
  });

  const result = await evaluator.generateResult({
    from: opts.from ? new Date(opts.from) : undefined,
    to: opts.to ? new Date(opts.to) : undefined,
    force: opts.force,
  });

  const output = `
# ⭐ Summary
${result.summary}

# 🧪 Reflection
${result.reflection}`;

  console.log();

  if (outputPath) {
    fs.writeFileSync(outputPath, output);
    console.log(`Output to ${opts.output}`);
    process.exit(0);
  }

  console.log(output);
  process.exit(0);
};
