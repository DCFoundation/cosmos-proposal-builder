/**
 * Form component to enter Title and Description in a Governance Proposal
 */
export const TitleDescriptionInputs = ({
  communityForumLink,
}: {
  communityForumLink: string;
}) => (
  <>
    <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-1.5 sm:pt-3">
      <label
        htmlFor="title"
        className="block text-sm font-medium text-[#0F3941]"
      >
        Title
      </label>
      <div>
        <input
          type="text"
          name="title"
          id="title"
          placeholder=""
          className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-[#CED7E8] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-teal-300"
        />
      </div>
    </div>

    <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-1.5 sm:pt-3">
      <label
        htmlFor="description"
        className="text-sm font-medium text-[#0F3941]"
      >
        Description
      </label>

      <p className="mt-1.5 text-sm text-[#5E5E5E] font-normal">
        Write a few sentences about the proposal and include any relevant
        links. Before proposing to Mainnet, please ensure you've started a
        discussion on the{" "}
        <a
            className="cursor-pointer text-[#2CB7D3] hover:text-gray-900 underline"
            href={communityForumLink}
        >
          Community Forum
        </a>
        .
      </p>

      <div className="mt-1">
        <textarea
          id="description"
          name="description"
          rows={3}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-[#CED7E8] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-teal-300"
          defaultValue={""}
          placeholder="Description"
        />

      </div>
    </div>
  </>
);
