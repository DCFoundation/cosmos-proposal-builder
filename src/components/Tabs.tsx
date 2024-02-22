import { ReactNode, useEffect, useMemo, useState } from "react";
import { Tab } from "@headlessui/react";
import qs from "query-string";
import { navigate, useSearch } from "wouter/use-location";
import { classNames } from "../utils/classNames";
import { updateSearchString } from "../utils/updateSearchString";
import {Footer} from "./Footer.tsx";

interface TabsProps {
  tabs: {
    title: string;
    msgType: QueryParams["msgType"];
    content: ReactNode;
  }[];
}

const Tabs = ({ tabs }: TabsProps) => {
  const { msgType } = qs.parse(useSearch());
  const idxFromSearch = useMemo(
    () =>
      Math.max(
        tabs.findIndex((x) => x.msgType === msgType),
        0,
      ),
    [msgType, tabs],
  );
  const [selectedIdx, setSelectedIdx] = useState(idxFromSearch);

  const handleChange = (idx: number) => {
    setSelectedIdx(idx);
    const { msgType } = tabs[idx];
    navigate(updateSearchString({ msgType }));
  };

  useEffect(() => {
    if (idxFromSearch !== selectedIdx) setSelectedIdx(idxFromSearch);
  }, [idxFromSearch, selectedIdx]);

  return (
    <div className="w-full max-w-4xl px-2 py-2 sm:px-0 m-auto">
      <Tab.Group selectedIndex={selectedIdx} onChange={handleChange}>

        <div className={'flex flex-wrap rounded-xl bg-white'}>
          <div className={'basis-full md:basis-5/12 md:p-[40px]'}>
            <div className={'flex flex-wrap items-stretch h-full'}>
              <div className={''}>
                <Tab.List className="flex flex-wrap">
                  {tabs.map(({ title }) => (
                      <Tab
                          key={title}
                          className={({ selected }) =>
                              classNames(
                                  "w-full text-sm font-medium",
                                  "text-left py-2.5 px-4 outline-none rounded-md",
                                  selected
                                      ? "text-[#D3482C] font-semibold menu-item-selected"
                                      : "text-[#BCC5D6]",
                              )
                          }
                      >
                        {title}
                      </Tab>
                  ))}
                </Tab.List>
              </div>
              <div className={'self-end'}>
                <Footer/>
              </div>
            </div>
          </div>
          <div className={'basis-full md:basis-7/12 md:pr-[40px] py-[40px]'}>
            <Tab.Panels className="">
              {tabs.map(({ content }, idx) => (
                  <Tab.Panel
                      key={idx}
                      unmount={false}
                      className="flex flex-col min-w-full"
                  >
                    {content}
                  </Tab.Panel>
              ))}
            </Tab.Panels>
          </div>
        </div>
      </Tab.Group>
    </div>
  );
};

export { Tabs };
