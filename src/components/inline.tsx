import { ReactNode } from "react";
import { classNames as cn } from "../utils/classNames";

export function Code({
  children,
  classNames,
}: {
  children: ReactNode;
  classNames?: string;
}) {
  return (
    <code
      className={cn(
        "bg-gray-200 rounded p-1 font-mono text-xs",
        classNames || "",
      )}
    >
      {children}
    </code>
  );
}
