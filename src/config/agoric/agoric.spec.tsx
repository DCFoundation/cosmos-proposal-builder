import "../../installSesLockdown";
import { fireEvent, render, screen } from "@testing-library/react";
import { Router } from "wouter";
import App from "../../App";
import { ContextProviders } from "../../contexts/providers";
import { memoryLocation } from "../../test-utils";
import { parseEnableChunking } from "./agoric";

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
    expect(parseEnableChunking("")).toEqual({
      enableChunking: false,
      chunkSizeOverride: null,
      invalidOverrideRaw: null,
    });
    expect(parseEnableChunking("?other=1")).toEqual({
      enableChunking: false,
      chunkSizeOverride: null,
      invalidOverrideRaw: null,
    });
  });

  it("enables without an override when the param is present but valueless", () => {
    expect(parseEnableChunking("?enable-chunking")).toEqual({
      enableChunking: true,
      chunkSizeOverride: null,
      invalidOverrideRaw: null,
    });
    expect(parseEnableChunking("?enable-chunking=")).toEqual({
      enableChunking: true,
      chunkSizeOverride: null,
      invalidOverrideRaw: null,
    });
  });

  it("accepts a positive integer override", () => {
    expect(parseEnableChunking("?enable-chunking=50000")).toEqual({
      enableChunking: true,
      chunkSizeOverride: 50000,
      invalidOverrideRaw: null,
    });
  });

  it("rejects non-positive, non-integer, and non-numeric values, surfacing the raw", () => {
    for (const bad of ["0", "-5", "1.5", "abc"]) {
      expect(parseEnableChunking(`?enable-chunking=${bad}`)).toEqual({
        enableChunking: true,
        chunkSizeOverride: null,
        invalidOverrideRaw: bad,
      });
    }
  });
});
