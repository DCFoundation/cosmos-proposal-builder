import "../../installSesLockdown";
import { render, screen } from "@testing-library/react";
import { Router } from "wouter";
import App from "../../App";
import { ContextProviders } from "../../contexts/providers";
import { memoryLocation } from "../../test-utils";

describe("Inter Config", () => {
  it("renders proposal type tabs", async () => {
    render(
      <Router hook={memoryLocation("/inter")}>
        <ContextProviders>
          <App />
        </ContextProviders>
      </Router>,
    );

    const tabListEl = (await screen.findAllByRole("tablist"))[0];
    expect(tabListEl).toBeTruthy();

    const tabs = [...tabListEl.querySelectorAll("button")].map(
      (x) => x.innerText,
    );
    expect(tabs).toEqual(["Add PSM", "Add Vault Collateral Type"]);
  });
});
