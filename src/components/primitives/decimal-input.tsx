import type { ComponentProps } from "react";

import { Input } from "@/components/primitives/input";

type DecimalInputProps = Omit<ComponentProps<typeof Input>, "type">;

function DecimalInput(props: DecimalInputProps) {
  return <Input {...props} type="text" inputMode="decimal" />;
}

export { DecimalInput };
export type { DecimalInputProps };
