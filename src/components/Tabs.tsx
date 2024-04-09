import { ReactNode, useEffect, useMemo, useState } from "react";
import { Tab } from "@headlessui/react";
import qs from "query-string";
import { navigate, useSearch } from "wouter/use-location";
import { classNames } from "../utils/classNames";
import { updateSearchString } from "../utils/updateSearchString";
import { Footer } from "./Footer.tsx";

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

  const [open, setOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("");

  const handleChange = (idx: number) => {
    setSelectedIdx(idx);
    const { msgType } = tabs[idx];
    navigate(updateSearchString({ msgType }));
  };

  useEffect(() => {
    if (idxFromSearch !== selectedIdx) setSelectedIdx(idxFromSearch);
  }, [idxFromSearch, selectedIdx]);

  const changeMenu = (value: string) => {
    setOpen(false);
    setSelectedMenu(value);
  };

  return (
    <div className="w-full max-w-7xl px-2 py-2 sm:px-0 m-auto">
      <Tab.Group selectedIndex={selectedIdx} onChange={handleChange}>
        <div className={"flex flex-wrap rounded-xl bg-white"}>
          <div className={"basis-full md:basis-5/12 md:p-[40px]"}>
            <div className={"flex flex-wrap items-stretch h-full"}>
              <div
                className={
                  "fixed md:hidden bottom-0 z-10 bg-white left-0 w-full"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <div
                    className={
                      "basis-auto px-[25px] text-blue text-[20px] font-semibold"
                    }
                  >
                    {selectedMenu || (
                      <span className={"text-[#0F394166]"}>-select-</span>
                    )}
                  </div>
                  <div className={"basis-auto"}>
                    {open ? (
                      <svg
                        onClick={() => setOpen(!open)}
                        width="83"
                        height="80"
                        viewBox="0 0 83 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer"
                      >
                        <rect width="83" height="80.3226" fill="#FFD6CE" />
                        <path
                          d="M49.25 32.75L33.75 48.25M33.75 32.75L49.25 48.25"
                          stroke="#D3482C"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        onClick={() => setOpen(!open)}
                        xmlns="http://www.w3.org/2000/svg"
                        width="83"
                        height="80"
                        viewBox="0 0 83 80"
                        fill="none"
                        className="cursor-pointer"
                      >
                        <rect width="83" height="80.3226" fill="#FFD6CE" />
                        <path
                          d="M30 34H52"
                          stroke="#D3482C"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M30 40H52"
                          stroke="#D3482C"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M30 46H52"
                          stroke="#D3482C"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`fixed w-full md:relative bg-white z-20 ${
                  open
                    ? "bottom-[80px] md:bottom-auto"
                    : "bottom-[-9999px] md:bottom-auto"
                }`}
              >
                <Tab.List className="flex flex-wrap">
                  {tabs.map(({ title }) => (
                    <Tab
                      key={title}
                      onClick={() => changeMenu(title)}
                      className={({ selected }) =>
                        classNames(
                          "text-black text-[20px] md:w-full md:text-sm font-medium w-full",
                          "text-left py-5 md:py-2.5 px-4 outline-none md:rounded-md",
                          selected
                            ? "md:text-red font-semibold menu-item-selected flex"
                            : "md:text-light2",
                        )
                      }
                    >
                      {title}
                    </Tab>
                  ))}
                </Tab.List>
              </div>
              <div className={"self-end hidden md:flex"}>
                <Footer />
              </div>
            </div>
          </div>
          <div
            className={
              "basis-full md:basis-7/12 p-[20px] md:pr-[40px] py-[40px]"
            }
          >
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
