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
      "Community Pool Spend",
    ]);
  });

  vi.mock("../../hooks/useWallet", () => ({
    useWallet: vi.fn(() => ({
      walletAddress: "agoric12se",
      stargateClient: {
        simulate: vi.fn(),
        signAndBroadcast: vi.fn(),
      },
    })),
  }));

  vi.mock("../../lib/signAndBroadcast", () => ({
    makeSignAndBroadcast: vi.fn(),
  }));
  it(" renders comm spend proposal form", async () => {
    // const mockTxResult = {
    //   code: 0,
    //   events: [],
    // };
    // makeSignAndBroadcast(vi.fn().mockResolvedValue(mockTxResult));

    render(
      <Router hook={memoryLocation("/agoric")}>
        <ContextProviders>
          <App />
        </ContextProviders>
        ,
      </Router>,
    );
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

    // const submitButton = await screen.findByRole("button", {
    //   name: "Sign & Submit",
    // });
    // fireEvent.click(submitButton);

    // expect(makeSignAndBroadcast).toHaveBeenCalledWith(
    //   expect.any(Object), // stargateClient mock
    //   'agoric12se',
    //   expect.any(String), // netName
    // );
  });
});
