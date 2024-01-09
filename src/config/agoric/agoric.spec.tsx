import "../../installSesLockdown";
import { render, screen } from "@testing-library/react";
import { Router } from "wouter";
import App from "../../App";
import { ContextProviders } from "../../contexts/providers";
import { memoryLocation } from "../../test-utils";

describe("Agoric Config", () => {
  it("renders proposal type tabs", async () => {
    render(
      <Router hook={memoryLocation("/agoric")}>
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
    expect(tabs).toEqual([
      "Text Proposal",
      "CoreEval Proposal",
      "Install Bundle",
      "Parameter Change Proposal",
    ]);
  });
});
