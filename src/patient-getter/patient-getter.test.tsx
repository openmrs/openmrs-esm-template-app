import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientGetter from "./patient-getter.component";

/**
 * This is an idiomatic mock of a backend resource. We generally mock resource fetching functions like `usePatient`, rather than mocking `fetch` or anything lower-level.
 */
jest.mock("./patient-getter.resource.ts", () => ({
  usePatient: jest.fn(() => ({
    patient: {
      birthDate: "1997-05-21",
      gender: "male",
      name: [
        {
          family: "Testguy",
          given: "Joeboy",
          id: "abc123",
        },
      ],
    },
  })),
}));

it("gets a patient when the button is clicked", async () => {
  render(<PatientGetter />);

  const user = userEvent.setup();
  const heading = screen.getByRole("heading", { name: /data fetching/i });
  const button = screen.getByRole("button", {
    name: /get a patient named 'test'/i,
  });

  expect(heading).toBeInTheDocument();
  expect(button).toBeInTheDocument();

  await waitFor(() => user.click(button));

  expect(
    screen.getByText(/Joeboy Testguy \/ male \/ 1997-05-21/)
  ).toBeInTheDocument();
});
