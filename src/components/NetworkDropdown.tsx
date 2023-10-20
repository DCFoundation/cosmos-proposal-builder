import { useMemo } from "react";
import { useNetwork } from "../hooks/useNetwork";
import { capitalize } from "../utils/capitalize";
import { updateSearchString } from "../utils/updateSearchString";
import { DropdownMenu } from "../components/DropdownMenu";
import { useSearch } from "wouter/use-location";

const NetworkDropdown = () => {
  const searchString = useSearch();
  const { netName, netNames } = useNetwork();
  const title = netName ? capitalize(netName) : "Select Network";

  const items = useMemo(
    () =>
      netNames.map((network) => ({
        label: capitalize(network),
        href: updateSearchString({ network }),
      })),
    // incl searchString to regenerate links if query params change
    [netNames, searchString]
  );

  return <DropdownMenu title={title} items={items} />;
};

export { NetworkDropdown };
