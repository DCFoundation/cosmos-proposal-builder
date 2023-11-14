import { ReactNode } from "react";

interface NavProps {
  title?: string;
  showLogo?: boolean;
  rightContent?: ReactNode;
}

const Nav = ({ title, showLogo, rightContent }: NavProps) => (
  <nav className="bg-teal-600 shadow-sm">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center space-x-1">
          {showLogo ? (
            <div className="flex-shrink-0">
              <img className="h-7 w-7" src="dcf.png" alt="DCFoundation" />
            </div>
          ) : null}
          <h1 className="text-white px-3 py-2 font-semibold text-md">
            {title}
          </h1>
        </div>

        <div className="flex items-center">{rightContent}</div>
      </div>
    </div>
  </nav>
);

Nav.defaultProps = {
  title: "Agoric Gov Proposal Builder",
  showLogo: true,
};

export { Nav };
