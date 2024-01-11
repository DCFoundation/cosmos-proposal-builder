import { DepositSection } from "./DepositSection";
import { TitleDescriptionInputs } from "./TitleDescriptionInputs";

export const GovDetails = ({
  governanceForumLink,
}: {
  governanceForumLink: string;
}) => (
  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
    <TitleDescriptionInputs communityForumLink={governanceForumLink} />
    <DepositSection />
  </div>
);
