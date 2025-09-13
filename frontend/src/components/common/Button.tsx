interface Props {
  // Optional for convenience as in many cases a button will be always enabled,
  // although it is very easy to mistakenly leave a property out that was
  // supposed to be set.
  className?: string
  disabled?: boolean
  text: string
  onClick: () => void
}

// A trivial wrapper for HTML button mainly to ensure the type is set so that
// there's no quirky behavior inside forms.
function Button (props: Props): React.JSX.Element {
  return (
    <button
      className={props.className}
      disabled={props.disabled}
      onClick={props.onClick}
      type='button'
     >
      {props.text}
    </button>
  )
}

export default Button
