import { setup } from "./env";
import { prompt } from "./prompt";
import { run } from "./run";
import { program } from "@commander-js/extra-typings";
import packageJson from "../../package.json";

program.version(
  packageJson.version,
  "-v, --vers",
  "output the current version"
);

/* run command */
program
  .command("run")
  .description("Generate a summary and reflection based on Notion contents")
  .option(
    "-d, --database <databaseId>",
    // "データベースID, 省略時は環境変数NOTION_DATABASE_ID"
    "databaseId, if omitted, use the environment variable NOTION_DATABASE_ID"
  )
  .option(
    "-f, --from <fromDate>",
    // "開始日 (例: 2024-07-01), 省略時は今月1日"
    "start date (e.g. 2024-07-01), if omitted, the first day of the current month"
  )
  .option(
    "-t, --to <toDate>",
    // "終了日 (例: 2024-07-31), 省略時は開始日の月末まで"
    "end date (e.g. 2024-07-31), if omitted, until the end of the start date"
  )
  .option(
    "-o, --output <outputPath>",
    // "出力先ファイルパス, 省略時は標準出力"
    "output file path, if omitted, standard output"
  )
  .option(
    "--force",
    // "cacheを使わずnotionのコンテンツを取得する"
    "fetch Notion contents without using cache",
    false
  )
  .option(
    "--dry-run",
    // "OPENAI APIを実行せずにプロンプトとNotionから取得したコンテンツを表示する"
    "Display prompts and contents retrieved from Notion without executing the OPENAI API",
    false
  )
  .action(run);

/* env command */
program
  .command("env")
  .description("Set up the environment variables")
  .option(
    "-l, --list",
    "List the environment variables that need to be set up",
    false
  )
  .action(setup);

/* prompt command */
program
  .command("prompt")
  .description("Set up the configuration file")
  .option(
    "-l, --list",
    "List the configuration file that need to be set up",
    false
  )
  .action(prompt);

program.parse();
