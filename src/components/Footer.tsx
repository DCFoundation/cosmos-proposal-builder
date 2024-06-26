interface FooterProps {
  links: {
    name: string;
    href: string;
  }[];
  text?: string;
}

const Footer = ({ text, links }: FooterProps) => {
  return (
    <div>
      <div className="">
        <nav className="" aria-label="Footer">
          {links.map((item) => (
            <div key={item.name} className="pb-1">
              <a
                href={item.href}
                target={"_blank"}
                className="text-sm text-grey hover:text-gray-900"
              >
                {item.name}
              </a>
            </div>
          ))}
        </nav>
        {text ? (
          <p className="mt-6 mb-2 text-center text-sm leading-5 text-gray-500">
            {text}
          </p>
        ) : null}
      </div>
    </div>
  );
};

Footer.defaultProps = {
  links: [
    {
      name: "View Source",
      href: "https://github.com/DCFoundation/cosmos-proposal-builder",
    },
    {
      name: "Request a Feature",
      href: "https://github.com/DCFoundation/cosmos-proposal-builder/issues/new?template=feature_request.md&labels=enhancement",
    },
    {
      name: "Report a Bug",
      href: "https://github.com/DCFoundation/cosmos-proposal-builder/issues/new?template=bug_report.md&labels=bug",
    },
  ],
  text: undefined,
};

export { Footer };
