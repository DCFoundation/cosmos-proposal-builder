import "./installSesLockdown.js";
import { render, screen, within } from "@testing-library/react";
import App from "./App";
import { ContextProviders } from "./contexts/providers.tsx";

describe("App.tsx", () => {
  it("renders app title", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>,
    );

    const titleElement = await screen.findByText("Cosmos Proposal Builder", {
      selector: "h2",
    });
    expect(titleElement).toBeTruthy();
  });

  it("renders the wallet connection button", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>,
    );

    const buttonEl = await screen.findByRole("button", {
      name: "Connect Wallet",
    });
    expect(buttonEl).toBeTruthy();
  });

  it("renders the chain dropdown", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>,
    );

    const navElement = screen.getAllByRole("navigation")[0];
    const selectElement = within(navElement).getByRole("button", {
      name: "Select",
      expanded: false,
    });
    expect(selectElement).toBeTruthy();

    describe.todo("selecting value puts chain in pathname");
    describe.todo("changing value resets the network dropdown value");
  });

  it("renders the network dropdown", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>,
    );

    const navElement = screen.getAllByRole("navigation")[0];
    const selectElement = within(navElement).getByRole("button", {
      name: "Select Network",
      expanded: false,
    });
    expect(selectElement).toBeTruthy();
  });

  it("renders list of chains as tiles", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>,
    );
    const chainListEl = await screen.findByRole("list");
    const chains = [...chainListEl.querySelectorAll("li")].map(
      (x) => x.querySelector("span")?.innerText,
    );
    expect(chains.length).toBeGreaterThanOrEqual(2);
    expect(chains.includes("Agoric")).toBeTruthy();
    expect(chains.includes("Inter")).toBeTruthy();
  });

  it("renders the footer with 3 links", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>,
    );

    const footerEl = await screen.findByRole("contentinfo");
    expect(footerEl.querySelectorAll("a").length).toBe(3);
  });
});
