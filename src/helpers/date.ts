export const startMonth = (date: Date) => {
  const newDate = new Date(date);
  return new Date(newDate.getFullYear(), newDate.getMonth(), 1);
};

export const endMonth = (date: Date) => {
  const newDate = new Date(date);
  return new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
};

export const formatDate = (
  date: Date,
  format: "yyyy-mm-dd" | "yyyy/mm/dd" = "yyyy-mm-dd"
) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return format
    .replace("yyyy", year.toString())
    .replace("mm", month.toString().padStart(2, "0"))
    .replace("dd", day.toString().padStart(2, "0"));
};

/**
 * Returns ISO 8601 formatted date strings for the given date range.
 */
export const validDateRange = (
  _from?: Date,
  _to?: Date
): {
  from: string;
  to: string;
} => {
  const today = new Date();
  const from = _from
    ? _from
    : _to
      ? startMonth(new Date(_to)) // toがある場合はtoの月の最初
      : startMonth(today); // どちらもない場合は今月の最初
  const to = _to ? _to : endMonth(from);

  // 日付のみ指定された場合は今日の日付に変換
  if (from.getFullYear() < 2002) {
    from.setFullYear(today.getFullYear());
  }
  if (to.getFullYear() < 2002) {
    to.setFullYear(today.getFullYear());
  }

  // fromの時間を0時に設定
  from.setHours(0, 0, 0, 0);
  // toの時間を23時59分59秒に設定
  to.setHours(23, 59, 59, 999);

  // dateが不正だったらエラーを投げる
  if (from > to) {
    throw new Error("Invalid date range");
  }

  return { from: from.toISOString(), to: to.toISOString() };
};
