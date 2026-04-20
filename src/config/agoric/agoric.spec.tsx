import "../../installSesLockdown";
import { fireEvent, render, screen } from "@testing-library/react";
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

    const tabListEl = (await screen.findAllByRole("tablist"))[0];
    expect(tabListEl).toBeTruthy();

    const tabs = [...tabListEl.querySelectorAll("button")].map(
      (x) => x.innerText,
    );
    expect(tabs).toEqual([
      "Text Proposal",
      "CoreEval Proposal", 
      "Install Bundle",
      "Parameter Change Proposal",
      "Community Pool Spend",
      "Gov v1 Parameters",
    ]);
  });

  it("renders comm spend proposal form", async () => {
    render(
      <Router hook={memoryLocation("/agoric")}>
        <ContextProviders>
          <App />
        </ContextProviders>
      </Router>,
    );

    // Wait for the tabs to render
    await screen.findAllByRole("tablist");

    const communityPoolSpendTab = await screen.findByRole("tab", {
      name: "Community Pool Spend",
    });
    fireEvent.click(communityPoolSpendTab);

    const recipientField = await screen.findByLabelText("Recipient");
    expect(recipientField).toBeTruthy();

    const amountField = await screen.findByLabelText("Amount");
    expect(amountField).toBeTruthy();

    fireEvent.change(recipientField, { target: { value: "agoric12se" } });
    fireEvent.change(amountField, { target: { value: "1000000" } });
  });
});
