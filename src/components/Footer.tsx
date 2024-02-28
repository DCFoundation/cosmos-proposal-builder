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
                className="text-sm text-[#455659] hover:text-gray-900"
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
      href: "https://github.com/DCFoundation/cosmos-proposal-builder/issues/new",
    },
    {
      name: "Report a Bug",
      href: "https://github.com/DCFoundation/cosmos-proposal-builder/issues/new",
    },
  ],
  text: undefined,
};

export { Footer };
