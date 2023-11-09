import { useRef, useState } from "react";
import { classNames } from "../utils/classNames";
import { stepFromValue } from "../utils/stepFromValue";
import { useClickOutside } from "../hooks/useClickOutside";

export type RowValue = Record<string, string>;

interface EditableTableProps {
  handleValueChanged: (key: string, value: string) => void;
  rows: RowValue[];
  headers: string[];
  transformInput?: (value: string) => string | number;
  valueKey: string;
  inputType?: HTMLInputElement["type"];
}

const EditableTable = ({
  handleValueChanged,
  rows,
  headers,
  transformInput,
  valueKey = "value",
  inputType = "number",
}: EditableTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingKey, setEditingKey] = useState<string | undefined>(undefined);

  useClickOutside(tableRef, () => {
    if (editingKey) {
      setEditingKey(undefined);
    }
  });

  const renderThead = (title: string, idx: number) => (
    <th
      key={title}
      scope="col"
      className={classNames(
        "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
        idx === 0 ? "sm:pl-0" : ""
      )}
    >
      {title}
    </th>
  );

  const shouldTransform = typeof transformInput === "function";

  const renderRow = (row: RowValue) => {
    const transformedInput = shouldTransform
      ? transformInput(row[valueKey])
      : row[valueKey];
    return (
      <tr key={row.key}>
        <td
          scope="col"
          className={classNames(
            "whitespace-nowrap px-3 py-4 text-sm text-gray-500",
            "text-gray-900 sm:pl-0"
          )}
        >
          {row.key}
        </td>
        {shouldTransform && (
          <td
            scope="col"
            className={"whitespace-nowrap px-3 py-4 text-sm text-gray-500"}
          >
            {row[valueKey]}
          </td>
        )}
        <td
          scope="col"
          className={classNames(
            "whitespace-nowrap text-sm text-gray-500 w-44",
            editingKey !== row.key ? "px-3 py-4" : ""
          )}
        >
          <div style={{ width: "100%", height: "100%" }}>
            {editingKey !== row.key ? (
              transformedInput
            ) : (
              <input
                ref={inputRef}
                type={inputType}
                min={inputType === "number" ? "0" : undefined}
                //min="1e-12" // @todo, should be one bean (feeUnit)
                step={
                  inputType === "number"
                    ? stepFromValue(transformedInput)
                    : undefined
                }
                name={row.key}
                id={row.key}
                defaultValue={transformedInput}
                className="block w-full h-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:max-w-sm sm:text-sm sm:leading-6"
              />
            )}
          </div>
        </td>
        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
          <button
            className="text-cardinal-600 hover:text-cardinal-900 w-10"
            onClick={(e) => {
              e.preventDefault();
              // turn on edit mode
              if (editingKey !== row.key) return setEditingKey(row.key);
              // save changes
              handleValueChanged(row.key, inputRef?.current?.value as string);
              // @todo, toast
              setEditingKey(undefined);
            }}
          >
            {editingKey !== row.key ? "Edit" : "Save"}
            <span className="sr-only">, {row.key}</span>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table
              ref={tableRef}
              className="min-w-full divide-y divide-gray-300"
            >
              <thead>
                <tr>
                  {headers?.map(renderThead)}
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows?.map(renderRow)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export { EditableTable };
