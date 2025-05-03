import type { Validation } from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";

export function formatError<T>(decoded: Validation<T>): string {
  return `Could not validate data: ${PathReporter.report(decoded).join("\n")}`
}
