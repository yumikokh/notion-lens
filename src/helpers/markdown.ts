const trimLinks = (text: string) => {
  return text
    .replace(/\[.*?\]\(.*?\)/g, "[link]")
    .replace(/!\[.*?\]\(.*?\)/g, "[image]")
    .replace(/```.*?```/g, "[code]");
};

export { trimLinks };
