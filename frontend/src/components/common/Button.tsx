interface Props {
  className?: string
  // Optional for convenience as in many cases a button will be always enabled,
  // although it is very easy to mistakenly leave a property out that was
  // supposed to be set.
  disabled?: boolean
  text: string
  // Explicit undefined onClick is intended for temporarily excluding handler,
  // for example when one cannot be constructed due to missing data. Disables
  // the button regardless of the current disabled property value.
  onClick: (() => void) | undefined
}

// A trivial wrapper for HTML button mainly to ensure the type is set so that
// there's no quirky behavior inside forms.
function Button(props: Props): React.JSX.Element {
  return (
    <button
      className={props.className}
      disabled={props.disabled === true || props.onClick === undefined}
      onClick={props.onClick}
      type='button'
    >
      {props.text}
    </button>
  )
}

export default Button
