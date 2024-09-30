import { APIResponseError, Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { isISO8601 } from "validator";

import { parseProperties } from "./helpers/notion";
import { validDateRange } from "./helpers/date";
import { trimLinks } from "./helpers/markdown";

type Options = {
  from?: Date;
  to?: Date;
  force?: boolean;
};

type CacheHandler = {
  readCache?: (key: string) => string | null;
  writeCache?: (key: string, content: string) => void;
};

type Page = Awaited<
  ReturnType<Client["databases"]["query"]>
>["results"][number];

/**
 * @class NotionSerializer - The class for interacting with the Notion API to retrieve and serialize content from a specified Notion database.
 */
export class NotionSerializer {
  private notion: Client;
  private databaseId: string;
  private options?: Options;
  private cache?: CacheHandler;

  constructor({
    apiKey,
    databaseId,
    options,
    cache,
  }: { apiKey: string; databaseId: string } & { options?: Options } & {
    cache?: CacheHandler;
  }) {
    this.notion = new Client({
      auth: apiKey,
    });
    this.databaseId = databaseId;
    this.options = options;
    this.cache = cache;
  }

  /**
   * Retrieves Notion contents within a specified date range.
   * Use cache when cached data is available and not forced.
   *
   * @param {Object} params - The parameters for retrieving Notion contents.
   * @param {string} [params.from] - The start date for the content retrieval. Defaults to the start of the current month if not provided.
   * @param {string} [params.to] - The end date for the content retrieval. Defaults to the end of the current month if not provided.
   * @param {boolean} [params.force] - If true, forces fetching new data even if cached data is available.
   * @param {Function} [params.readCache] - A function to read cached data based on a cache key.
   * @param {Function} [params.writeCache] - A function to write data to the cache with a cache key.
   *
   * @returns {Promise<string>} - A promise that resolves to the Notion contents as a string.
   */
  public async getNotionContents({
    from: _from,
    to: _to,
    force: _force,
  }: Options): Promise<string> {
    const { from, to } = validDateRange(
      _from || this.options?.from,
      _to || this.options?.to
    );

    const cacheKey = `${from}-${to}`;

    const previousOutput = this.cache?.readCache?.(cacheKey);

    const force = _force !== undefined ? _force : this.options?.force;
    if (previousOutput && !force) {
      console.log("cached notion contents found.");
      return previousOutput;
    }

    console.log("fetching notion contents...");

    const notionContents = await this.fetchPagesContents(
      this.databaseId,
      from,
      to
    );
    console.log("fetched notion contents  ✅");

    this.cache?.writeCache?.(cacheKey, notionContents);
    console.log("cached notion contents  ✅");

    return notionContents;
  }

  private async fetchPagesContents(
    databaseId: string,
    from: string,
    to: string
  ) {
    try {
      const pages = await this.fetchPagesByDatabase(databaseId, from, to);

      const pageTexts = await Promise.all(
        pages.flatMap((page) => this.serialize(page))
      );

      return pageTexts.join("");
    } catch (error) {
      if (error instanceof APIResponseError) {
        throw new Error(error.message);
      }
      console.error(error);
      throw new Error();
    }
  }

  private async serialize(page: Page) {
    const n2m = new NotionToMarkdown({ notionClient: this.notion });

    if (page.object !== "page") {
      return [];
    }

    let text: string = "";

    if ("properties" in page) {
      text += parseProperties(page.properties).join(" ");
    }

    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdBlocks);

    text += "\n";
    /* token消費をセーブするため、不要な文字を削除 */
    text += trimLinks(mdString.parent);
    text += "\n---\n";

    return text;
  }

  private async fetchPagesByDatabase(
    databaseId: string,
    from: string,
    to: string
  ) {
    if (!isISO8601(from) || !isISO8601(to)) {
      throw new Error("Invalid date format");
    }

    try {
      const response = await this.notion.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "Date",
            direction: "ascending",
          },
        ],
        filter: {
          and: [
            {
              property: "Date",
              date: {
                on_or_after: from,
              },
            },
            {
              property: "Date",
              date: {
                on_or_before: to,
              },
            },
          ],
        },
      });
      return response.results;
    } catch (error) {
      if (error instanceof APIResponseError) {
        throw new Error(error.message);
      }
      console.error(error);
      throw new Error();
    }
  }
}
