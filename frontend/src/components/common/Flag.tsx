import React from 'react'

interface Props {
  country: string | undefined
}

const countryCodeLength = 2

// Regional indicator symbols form a flag emoji when combined. They are laid
// out in the same order as the basic latin letters.
const regionalIndicatorOffset = 0x1f1e6 - 'A'.charCodeAt(0)

function toFlag(country: string): string {
  return [...country]
    .map((letter) =>
      String.fromCodePoint(letter.charCodeAt(0) + regionalIndicatorOffset),
    )
    .join('')
}

export function Flag(props: Props): React.JSX.Element | null {
  const country = props.country
  if (country === undefined || country.length !== countryCodeLength) {
    return null
  }
  return <span>{toFlag(country)}</span>
}

export default Flag
