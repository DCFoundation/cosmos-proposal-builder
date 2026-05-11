import "../../installSesLockdown";
import { fireEvent, render, screen } from "@testing-library/react";
import { Router } from "wouter";
import App from "../../App";
import { ContextProviders } from "../../contexts/providers";
import { memoryLocation } from "../../test-utils";
import { parseEnableChunking } from "./enableChunking";

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

describe("parseEnableChunking", () => {
  it("returns disabled when the param is absent", () => {
    expect(parseEnableChunking("")).toEqual({ kind: "disabled" });
    expect(parseEnableChunking("?other=1")).toEqual({ kind: "disabled" });
  });

  it("enables without an override when the param is present but valueless", () => {
    expect(parseEnableChunking("?enable-chunking")).toEqual({
      kind: "enabled",
    });
    expect(parseEnableChunking("?enable-chunking=")).toEqual({
      kind: "enabled",
    });
  });

  it("accepts a positive integer override", () => {
    expect(parseEnableChunking("?enable-chunking=50000")).toEqual({
      kind: "override",
      bytes: 50000,
    });
  });

  it("accepts a search string without a leading `?`", () => {
    expect(parseEnableChunking("enable-chunking=50000")).toEqual({
      kind: "override",
      bytes: 50000,
    });
  });

  it("takes the first occurrence when the param is repeated", () => {
    expect(
      parseEnableChunking("?enable-chunking=10&enable-chunking=20"),
    ).toEqual({ kind: "override", bytes: 10 });
  });

  it("rejects non-positive, non-integer, and non-numeric values, surfacing the raw", () => {
    for (const bad of ["0", "-5", "1.5", "abc"]) {
      expect(parseEnableChunking(`?enable-chunking=${bad}`)).toEqual({
        kind: "invalid",
        raw: bad,
      });
    }
  });
});
