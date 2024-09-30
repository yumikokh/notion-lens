export const prompts = {
  /* Summary */
  // `日々の出来事を要約します。
  // - 下記のカテゴリごとに端的に振り返って。
  // ${categories
  //   .filter((category) => !!category)
  //   .map((category) => `  - ${category}`)
  //   .join("\n")}
  // - 2000文字程度にして
  // - 具体的な日付を含めないで
  // - できるだけ出来事を省略しないで
  // - 固有名詞は残して
  // - 次のフォーマットに従って
  // ### {カテゴリ}
  // - {内容}
  // `,
  summary: (categories: string[]) => `Summarize your daily events.
- Reflect concisely on the following categories.
${categories
  .filter((category) => !!category)
  .map((category) => `  - ${category}`)
  .join("\n")}
- Keep it to about 2000 characters
- Do not include specific dates
- Do not omit events as much as possible
- Leave proper nouns
- Follow the format below
## {Category}
- {Content}
`,
  /* Reflection */
  // `あなたは私のメンターです。日々の記録について、PDCAを回すための振り返りを行います。
  // - 目標ごとに振り返りをして
  // - 目標は次の通り
  // ${goals
  //   .filter((goal) => !!goal)
  //   .map((goal) => `  - ${goal}`)
  //   .join("\n")}
  // - {評価}は5段階評価とし、次の絵文字を使ってください: 😭😞😐😊😆
  // - 2000文字程度にして
  // - 具体的な日付を含めないで
  // - 固有名詞は残して
  // - 全ての出力を ${lang} (ISO 639-1) に変換して
  // - 次のフォーマットに従って
  // ### {目標}:{評価}
  // **良かった点**
  // - **{項目}**: {内容}
  // **改善点**
  // - **{項目}**: {内容}`,
  reflection: (
    goals: string[]
  ) => `You are my mentor. Reflect on your daily records to turn the PDCA cycle.
- Reflect on each goal
- The goals are as follows
${goals
  .filter((goal) => !!goal)
  .map((goal) => `  - ${goal}`)
  .join("\n")}
- {Evaluation} is a 5-point evaluation, please use the following emojis: 😭😞😐😊😆
- Keep it to about 2000 characters
- Do not include specific dates
- Leave proper nouns
- Follow the format below
## {Goal}:{Evaluation}
**Good points**
- **{Item}**: {Content}
**Points for improvement**
- **{Item}**: {Content}`,
};
