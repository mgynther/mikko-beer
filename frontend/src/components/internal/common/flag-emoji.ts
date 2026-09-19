// A country code is two upper case letters. The backend is strict about the
// format, so anything else is a mistake that should not be masked here.
const countryCodePattern = /^[A-Z]{2}$/

// Regional indicator symbols form a flag emoji when combined. They are laid
// out in the same order as the basic latin letters.
const regionalIndicatorOffset = 0x1f1e6 - 'A'.charCodeAt(0)

function toRegionalIndicators(country: string): string {
  return [...country]
    .map((letter) =>
      String.fromCodePoint(letter.charCodeAt(0) + regionalIndicatorOffset),
    )
    .join('')
}

// Flag emoji of the country, or undefined when the country is unknown or is
// not a valid two letter country code.
export function flagEmoji(country: string | undefined): string | undefined {
  if (country === undefined || !countryCodePattern.test(country)) {
    return undefined
  }
  return toRegionalIndicators(country)
}

export default flagEmoji
