// Responses arrive wrapped in a single member envelope, { beer: ... } and the
// like. The envelope is a detail of how the backend answers a request, not of
// what the answer contains, so unwrapping it belongs here with the rest of the
// query handling rather than in the validation layer: only the member is
// checked and it is returned as unknown, for the validator of that type to
// judge. Before this existed the envelope was asserted by a type annotation
// and never checked, so a renamed member read as undefined and was reported as
// a missing object rather than a missing member.
//
// The check is written out rather than decoded with io-ts because io-ts stays
// in the validation layer. An array is not an envelope, which is what
// UnknownRecord used to say for us.
function isEnvelope(result: unknown): result is Record<string, unknown> {
  return typeof result === 'object' && result !== null && !Array.isArray(result)
}

export function unwrapMember(result: unknown, member: string): unknown {
  if (!isEnvelope(result)) {
    throw Error(
      `Could not unwrap data: expected an object, got ${typeof result}`,
    )
  }
  if (!(member in result)) {
    throw Error(`Could not unwrap data: missing member ${member}`)
  }
  return result[member]
}

export function unwrapMemberOrUndefined(
  result: unknown,
  member: string,
): unknown {
  if (typeof result === 'undefined') {
    return undefined
  }
  return unwrapMember(result, member)
}
