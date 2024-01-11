/**
 * Form component to enter Title and Description in a Governance Proposal
 */
export const TitleDescriptionInputs = ({
  communityForumLink,
}: {
  communityForumLink: string;
}) => (
  <>
    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="title"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Title
      </label>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Title"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-sm sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="description"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Description
      </label>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        <textarea
          id="description"
          name="description"
          rows={3}
          className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
          defaultValue={""}
          placeholder="Description"
        />
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Write a few sentences about the proposal and include any relevant
          links. Before proposing to Mainnet, please ensure you've started a
          discussion on the{" "}
          <a
            className="cursor-pointer hover:text-gray-900 underline"
            href={communityForumLink}
          >
            Community Forum
          </a>
          .
        </p>
      </div>
    </div>
  </>
);
