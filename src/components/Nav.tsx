import { ReactNode } from "react";
import { Link } from "wouter";
import { ChainMenu } from "./ChainMenu.tsx";
import { NetworkDropdown } from "./NetworkDropdown.tsx";

interface NavProps {
  title?: string;
  showLogo?: boolean;
  rightContent?: ReactNode;
}

const Nav = ({ title, showLogo, rightContent }: NavProps) => (
  <nav className="">
    <div className="mx-auto max-w-4xl">
      <div className="flex h-16 items-center justify-between px-2 pt-6">
        <div className="flex items-center space-x-1">
          {showLogo ? (
            <div className="flex-shrink-0">
              <a href="https://dcfoundation.io/">
                <img
                  className="h-7 w-7"
                  src="dcf-black.png"
                  alt="DCFoundation"
                />
              </a>
            </div>
          ) : null}
          <h1 className="text-white pr-3 py-2 font-semibold text-md">
            <Link href="/">
              <div
                className={
                  "bg-teal-500 text-xs font-medium me-2 px-2.5 py-0.5 rounded text-white"
                }
              >
                {title}
              </div>
            </Link>
          </h1>
        </div>

        <div className="flex items-center">{rightContent}</div>
      </div>

      <div className="flex sm:hidden items-center px-2 mt-7">
        <div className="basis-1/2 pr-[5px] relative">
          <ChainMenu />
        </div>
        <div className="basis-1/2 pl-[5px] relative">
          <NetworkDropdown />
        </div>
      </div>
    </div>
  </nav>
);

Nav.defaultProps = {
  title: "Cosmos Proposal Builder",
  showLogo: true,
};

export { Nav };
