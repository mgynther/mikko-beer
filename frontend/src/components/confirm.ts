export type Confirm = (text: string) => boolean

// window.confirm must be called with window as this. Passing the bare global
// function as a prop loses the context and results in an illegal invocation
// when it is called, so components take this wrapper instead.
export const confirmDialog: Confirm = (text: string) => window.confirm(text)
