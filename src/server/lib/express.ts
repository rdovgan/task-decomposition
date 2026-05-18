/**
 * Safely extract a single string value from an Express 5 request parameter or query value.
 *
 * Express 5's ParamsDictionary allows `string | string[]` and query values
 * can be `string | ParsedQs | (string | ParsedQs)[] | undefined`.
 */
export function str(val: unknown): string | undefined {
  if (typeof val === "string") return val;
  if (Array.isArray(val) && typeof val[0] === "string") return val[0];
  return undefined;
}
