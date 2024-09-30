import fs from "fs";
import path from "path";
import { askQuestion, rl } from "../helpers/readline";

const PROMPT_VAR = {
  summaryCategories: "summaryCategories",
  reflectionGoals: "reflectionGoals",
} as const;

const PROMPT_VARS = Object.values(PROMPT_VAR);

type PromptConfig = {
  [key in (typeof PROMPT_VARS)[number]]?: string[];
};

const questions = PROMPT_VARS.map(
  (key) => `Enter your ${key} (comma separated): `
);

export interface PromptOptions {
  list?: boolean;
}

export const prompt = async (opts: PromptOptions) => {
  const configPath = path.resolve(__dirname, "../../prompt/config.json");
  const backupPath = path.resolve(__dirname, "../../prompt/config.json.backup");

  if (opts.list) {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, "utf-8");
      console.info(`Current configuration: 
${configData}`);
    } else {
      console.info("config.json does not exist.");
    }
    process.exit(0);
  }

  const currentConfig: PromptConfig = JSON.parse(
    fs.readFileSync(configPath, "utf-8")
  );
  const newConfig = { ...currentConfig };

  const askQuestions = (questions: string[]) => {
    let index = 0;

    const askNextQuestion = async () => {
      // 中断したらもとに戻す
      if (index < questions.length) {
        const promptKey = PROMPT_VARS[index];
        const currentConfigValue = currentConfig[promptKey];
        if (currentConfigValue) {
          // 値があったら上書きするか聞く
          const yesOrNo = await askQuestion(
            `The current value of ${promptKey} is "${currentConfigValue}". Do you want to overwrite it? (y/n): `
          );

          if (yesOrNo === "n") {
            newConfig[promptKey] = currentConfigValue;
            index++;
            await askNextQuestion();
            return;
          } else if (yesOrNo === "y") {
            const answerValue = await askQuestion(questions[index]);
            newConfig[promptKey] = answerValue.split(",").map((v) => v.trim());
            index++;
            await askNextQuestion();
            return;
          }
          // pink
          console.info("Please enter 'y' or 'n'.");
          await askNextQuestion();
          return;
        }

        // 値がなかったら新しく入力
        const answerValue = await askQuestion(questions[index]);
        newConfig[promptKey] = [answerValue];
        console.info(`Your ${promptKey} is set to "${answerValue}".`);
        index++;
        await askNextQuestion();
        return;
      }

      // 全ての質問が終わったら質問を終了
      rl.close();

      // configファイルに書き込む
      const configContent = JSON.stringify(newConfig, null, 2);
      fs.writeFileSync(configPath, configContent);
      console.info("Prompt configuration is saved.");

      // バックアップファイルを削除
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }
    };

    askNextQuestion();
  };

  // configファイルのバックアップを作成
  if (fs.existsSync(configPath)) {
    fs.copyFileSync(configPath, backupPath);
  }

  if (!fs.existsSync(configPath)) {
    // config.jsonを作成
    fs.writeFileSync(configPath, "");
  }
  askQuestions(questions);

  rl.on("SIGINT", () => {
    console.info("\nProcess interrupted. Restoring the original config file.");
    // バックアップファイルからconfigファイルを復元
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, configPath);
      fs.unlinkSync(backupPath);
      console.info(".env file restored from backup.");
    }
    rl.close();
    process.exit(0);
  });
};
