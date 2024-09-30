import OpenAI from "openai";
import { NotionSerializer } from "./NotionSerializer";
import { prompts } from "./prompts";

type Config = {
  openAiApiKey: string;
  notionApiKey: string;
};

type PromptConfig = {
  summaryCategories?: string[];
  reflectionGoals?: string[];
} & { cache?: NotionSerializer["cache"] };

/**
 * @class NotionReflector - The class for generating summaries and reflections based on Notion contents.
 */
export class NotionReflector {
  private openai: OpenAI;
  private notion: NotionSerializer;
  private promptConfig: Required<PromptConfig>;

  constructor({
    config,
    databaseId,
    promptConfig,
  }: {
    config: Config;
    databaseId: string;
    promptConfig: PromptConfig;
  }) {
    this.openai = new OpenAI({
      apiKey: config.openAiApiKey,
    });
    this.notion = new NotionSerializer({
      apiKey: config.notionApiKey,
      databaseId,
      options: {},
      cache: {
        readCache: promptConfig.cache?.readCache,
        writeCache: promptConfig.cache?.writeCache,
      },
    });
    this.promptConfig = {
      summaryCategories: promptConfig.summaryCategories || [
        "Work",
        "Private",
        "Health",
      ],
      reflectionGoals: promptConfig.reflectionGoals || ["Not decided"],
      cache: promptConfig.cache || {},
    };
  }

  /**
   * Generates a summary and reflection based on Notion contents within a specified date range.
   *
   * @param options - The options for generating the result.
   * @param options.from - The start date for fetching Notion contents.
   * @param options.to - The end date for fetching Notion contents.
   * @param options.force - Whether to force fetch the Notion contents.
   * @param options.summaryCategories - The categories to be used for summarization.
   * @param options.reflectionGoals - The goals to be used for reflection.
   *
   * @returns An object containing the summary and reflection results.
   * @returns summary - The generated summary result.
   * @returns reflection - The generated reflection result.
   *
   * @remarks
   * This method executes the summary and reflection generation in sequence to reduce token usage.
   */
  public async generateResult(
    options: Parameters<NotionSerializer["getNotionContents"]>[0] &
      Pick<PromptConfig, "summaryCategories" | "reflectionGoals">
  ) {
    const notionContents = await this.notion.getNotionContents({
      from: options.from,
      to: options.to,
      force: options.force,
    });

    const summaryCategories =
      options.summaryCategories || this.promptConfig.summaryCategories;
    const reflectionGoals =
      options.reflectionGoals || this.promptConfig.reflectionGoals;

    const { summaryPrompt, reflectionPrompt } = this.generatePrompt({
      summaryCategories,
      reflectionGoals,
    });

    /** NOTE: Exec in sequence to reduce token usage */
    console.log("Generating summary...");
    const summaryResult = await this.ask(summaryPrompt, notionContents);
    console.log("Total Tokens:", summaryResult.totalTokens);

    console.log("Generating reflection...");
    const reflectionResult = await this.ask(reflectionPrompt, notionContents);
    console.log("Total Tokens:", reflectionResult.totalTokens);

    console.log("Completed ✅");

    return {
      summary: summaryResult.result,
      reflection: reflectionResult.result,
    };
  }

  private generatePrompt({
    summaryCategories,
    reflectionGoals,
  }: Required<Pick<PromptConfig, "summaryCategories" | "reflectionGoals">>) {
    const summaryPrompt = prompts.summary(summaryCategories);
    const reflectionPrompt = prompts.reflection(reflectionGoals);

    return {
      summaryPrompt,
      reflectionPrompt,
    };
  }

  private async ask(prompt: string, content: string) {
    const stream = await this.openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        { role: "user", content },
      ],
    });
    return {
      result: stream.choices[0].message.content,
      totalTokens: stream.usage?.total_tokens,
    };
  }
}
