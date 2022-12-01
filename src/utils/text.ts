const pluralRules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes:Record<string, string> = {
  one: "st",
  two: "nd",
  few: "rd",
  other: "th"
};

export const INDENTATION_UNIT = "  ";
export function toOrdinal(value:number):string{
  return `${value}${suffixes[pluralRules.select(value)]}`;
}