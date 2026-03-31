type CxValue =
  | string
  | false
  | null
  | undefined
  | Record<string, boolean>;

export function cx(...values: CxValue[]) {
  return values
    .flatMap((value) => {
      if (!value) {
        return [];
      }
      if (typeof value === "string") {
        return [value];
      }
      return Object.entries(value)
        .filter(([, enabled]) => enabled)
        .map(([className]) => className);
    })
    .join(" ");
}
