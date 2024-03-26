import { ReactNode } from "react";
import { classNames } from "../utils/classNames";

export interface ButtonProps {
  onClick?: () => void;
  Icon?: ReactNode;
  text: string;
  theme: "light" | "dark" | "white" | "red" | "black" | "grey";
  layoutStyle?: string;
  type?: HTMLButtonElement["type"];
}

const butttonThemeStyles = {
  dark: "text-white bg-teal-600 focus-visible:outline-teal-600 hover:opacity-80",
  black: "text-white bg-black focus-visible:outline-teal-600 hover:opacity-80",
  red: "text-white rounded-lg py-[16px] text-base font-bold w-full bg-red focus-visible:outline-none hover:opacity-80",
  grey: "text-blue rounded-lg py-[14px] text-sm font-bold bg-[#0F39411A] focus-visible:outline-none hover:opacity-80",
  light:
    "text-black bg-teal-200 focus-visible:outline-teal-200 hover:bg-teal-300",
  white:
    "text-gray-900 bg-white ring-1 ring-inset ring-gray-300 focus-visible:outline-gray-300 hover:bg-gray-50",
};

const Button = ({
  onClick,
  text,
  Icon,
  theme,
  layoutStyle,
  type = "button",
}: ButtonProps): ReactNode => (
  <button
    type={type}
    className={classNames(
      "items-center justify-center rounded-md px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
      butttonThemeStyles[theme],
      layoutStyle || "inline-flex",
    )}
    onClick={onClick}
  >
    {Icon}
    {text}
  </button>
);


Button.defaultProps = {
  //Icon: <WalletIcon className="mr-1.5 h-5 w-8" aria-hidden="true" />,
  Icon: (
    <svg
      className={"mr-[10px] walletConnectButton"}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
    >
      <path
        d="M1 6.38889V2.53691M11.5 6H11.5078M1 3.43333L1 8.56666C1 9.43786 1 9.87345 1.16955 10.2062C1.31868 10.4989 1.55665 10.7369 1.84935 10.886C2.1821 11.0556 2.6177 11.0556 3.48889 11.0556H12.5111C13.3823 11.0556 13.8179 11.0556 14.1507 10.886C14.4433 10.7369 14.6813 10.4989 14.8305 10.2062C15 9.87345 15 9.43786 15 8.56666V3.43333C15 2.56214 15 2.12654 14.8305 1.79379C14.6813 1.5011 14.4433 1.26313 14.1507 1.11399C13.8179 0.944444 13.3823 0.944444 12.5111 0.944444L3.48889 0.944443C2.6177 0.944443 2.1821 0.944443 1.84935 1.11399C1.55665 1.26312 1.31868 1.50109 1.16955 1.79379C1 2.12654 1 2.56214 1 3.43333ZM11.8889 6C11.8889 6.21478 11.7148 6.38889 11.5 6.38889C11.2852 6.38889 11.1111 6.21478 11.1111 6C11.1111 5.78522 11.2852 5.61111 11.5 5.61111C11.7148 5.61111 11.8889 5.78522 11.8889 6Z"
        className={"stroke"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  theme: "white",
};

export { Button };
