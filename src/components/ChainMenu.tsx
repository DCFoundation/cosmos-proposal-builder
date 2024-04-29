import { useMemo } from "react";
import { capitalize } from "../utils/capitalize";

import { DropdownMenu } from "../components/DropdownMenu";
import { useChain } from "../hooks/useChain";

// XXX Select Chain, Select App ?
const placeholderText = "Select Chain";

const ChainMenu = () => {
  const { chain, chains } = useChain();

  const title = chain ? capitalize(chain) : placeholderText;
  const labelImage = useMemo(
    () => (chain ? chains.find((c) => c.value === chain)?.image : undefined),
    [chain, chains],
  );

  return (
    <DropdownMenu
      title={title}
      label={placeholderText}
      labelImage={labelImage}
      items={chains}
      showImage={true}
      buttonStyle=""
      dropdownItemStyle=""
    />
  );
};

export { ChainMenu };
