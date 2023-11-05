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
        classNames || ""
      )}
    >
      {children}
    </code>
  );
}

export function Link({
  children,
  classNames,
  href,
}: {
  href: string;
  children: ReactNode;
  classNames?: string;
}) {
  return (
    <a
      className={cn(
        "cursor-pointer hover:text-gray-900 underline",
        classNames || ""
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      {children}
    </a>
  );
}
