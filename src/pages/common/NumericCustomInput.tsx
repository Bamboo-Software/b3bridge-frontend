/* eslint-disable @typescript-eslint/no-explicit-any */
export const NumericCustomInput = (props: any) => (
    <input
      {...props}
      className={
        'bg-transparent outline-none text-right text-foreground ' +
        (props.className || '')
      }
      autoComplete="off"
    />
  );