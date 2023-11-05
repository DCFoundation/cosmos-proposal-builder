import "./installSesLockdown.js";
import { render, screen, within } from "@testing-library/react";
import App from "./App";
import { ContextProviders } from "./contexts/providers.tsx";

describe("App.tsx", () => {
  it("renders app title", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>
    );

    const titleElement = await screen.findByText("Gov Proposal Builder");
    expect(titleElement).toBeTruthy();
  });

  it("renders the wallet connection button", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>
    );

    const buttonEl = await screen.findByRole("button", {
      name: "Connect Wallet",
    });
    expect(buttonEl).toBeTruthy();
  });

  it("renders the network dropdown", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>
    );

    const navElement = screen.getAllByRole("navigation")[0];
    const selectElement = within(navElement).getByRole("button", {
      description: "Select Network",
      expanded: false,
    });
    expect(selectElement).toBeTruthy();
  });

  it("renders proposal type tabs", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>
    );

    const tabListEl = await screen.findByRole("tablist");
    expect(tabListEl).toBeTruthy();
    const tabs = [...tabListEl.querySelectorAll("button")].map(
      (x) => x.innerText
    );
    expect(tabs).toEqual([
      "Text Proposal",
      "CoreEval Proposal",
      "Install Bundle",
      "Parameter Change Proposal",
    ]);
  });

  it("renders the footer with 3 links", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>
    );

    const footerEl = await screen.findByRole("contentinfo");
    expect(footerEl.querySelectorAll("a").length).toBe(3);
  });
});
