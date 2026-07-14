import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperationsDashboard } from "@/components/operations-dashboard";

describe("OperationsDashboard", () => {
  it("renders the CradleOS operations foundation", () => {
    render(<OperationsDashboard />);

    expect(
      screen.getByRole("heading", { level: 1, name: "CradleOS" })
    ).toBeInTheDocument();
    expect(screen.getByText("Repository initialized")).toBeInTheDocument();
    expect(screen.getByText("Caregiver intake")).toBeInTheDocument();
    expect(screen.getByText("References")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });
});
