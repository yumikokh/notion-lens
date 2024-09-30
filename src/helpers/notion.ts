import {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { match } from "ts-pattern";

/**
 * リッチテキストをプレーンテキストに変換する
 */
const parseRichText = (
  richTexts: RichTextItemResponse[],
  _option: { prefix?: string; separator?: string } = { separator: "" }
) => {
  const option = { prefix: "", separator: "", ..._option };
  if (option.prefix) {
    return `${option.prefix} ${richTexts
      .map((text) => text.plain_text)
      .join(option.separator)}`;
  }
  return richTexts.map((text) => text.plain_text).join(option.separator);
};

type Property = PageObjectResponse["properties"][string];
type WithoutId<T> = T extends { id: string } ? Omit<T, "id"> : T;

/**
 * プロパティをプレーンテキストに変換する
 */
const parseProperty = (property: WithoutId<Property>): string | number | null =>
  match(property)
    .with({ type: "title" }, (value) => {
      return parseRichText(value.title);
    })
    .with({ type: "number" }, (value) => {
      if (value.number === null) return null;
      return value.number;
    })
    .with({ type: "url" }, (value) => {
      if (value.url === null) return null;
      return value.url;
    })
    .with({ type: "select" }, (value) => {
      if (value.select === null) return null;
      return value.select.name;
    })
    .with({ type: "multi_select" }, (value) => {
      if (value.multi_select.length === 0) return null;
      return value.multi_select.map((v) => v.name).join(", ");
    })
    .with({ type: "status" }, (value) => {
      if (value.status === null) return null;
      return value.status.name;
    })
    .with({ type: "date" }, (value) => {
      if (value.date === null) return null;
      return value.date.start;
    })
    .with({ type: "email" }, (value) => {
      if (value.email === null) return null;
      return value.email;
    })
    .with({ type: "phone_number" }, (value) => {
      if (value.phone_number === null) return null;
      return value.phone_number;
    })
    .with({ type: "checkbox" }, (value) => {
      return value.checkbox ? "Yes" : "No";
    })
    .with({ type: "rich_text" }, (value) => {
      return parseRichText(value.rich_text);
    })
    .with({ type: "rollup" }, (value) => {
      if (value.rollup.type === "array") {
        return value.rollup.array
          .map((v) => parseProperty(v))
          .filter((v) => v !== null)
          .join(", ");
      }
      return parseProperty(value.rollup);
    })
    .with(
      { type: "files" },
      { type: "created_by" },
      { type: "created_time" },
      { type: "last_edited_by" },
      { type: "last_edited_time" },
      { type: "formula" },
      { type: "button" },
      { type: "unique_id" },
      { type: "verification" },
      { type: "people" },
      { type: "relation" },
      () => null
    )
    .exhaustive();

/**
 * ページプロパティをプレーンテキストに変換する
 */
const parseProperties = (
  properties: PageObjectResponse["properties"]
): string[] => {
  return (
    Object.entries(properties)
      .map(([key, property]) => {
        const value = parseProperty(property);
        return value !== null ? `${key}: ${value}` : null;
      })
      .filter((v) => v !== null)
      // Titleは先頭に持ってくる
      .sort((a, b) => {
        if (a?.startsWith("Title")) return -1;
        if (b?.startsWith("Title")) return 1;
        return 0;
      }) as string[]
  );
};

export { parseProperties };
