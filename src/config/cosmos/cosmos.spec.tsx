import { render, screen } from "@testing-library/react";
import { Router } from "wouter";
import { ContextProviders } from "../../contexts/providers";
import App from "../../App";
import { memoryLocation } from "../../test-utils";

describe("cosmos hub Config", () => {
  it("renders proposal type tabs", async () => {
    render(
      <Router hook={memoryLocation("/cosmos")}>
        <ContextProviders>
          <App />
        </ContextProviders>
      </Router>,
    );

    const tabListEl = await screen.findByRole("tablist");
    expect(tabListEl).toBeTruthy();

    const tabs = [...tabListEl.querySelectorAll("button")].map(
      (x) => x.innerText,
    );
    expect(tabs).toEqual(["Community Spend Proposal"]);
  });
});
