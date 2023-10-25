import "./installSesLockdown.js";
import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App", () => {
  it("renders title", async () => {
    render(<App />);

    await screen.findByText("Gov Proposal Hub");
    expect(screen.getByText("Gov Proposal Hub")).toBeTruthy();
  });
});
