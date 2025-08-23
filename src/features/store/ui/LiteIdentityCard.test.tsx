import { screen, fireEvent, waitFor } from "@testing-library/react";
import LiteIdentityCard from "./LiteIdentityCard";
import { renderWithProviders } from "@/test/test-utils";
import { vi } from "vitest";

vi.mock("@/shared/api/axios", () => ({
  default: { post: vi.fn().mockResolvedValue({}) },
}));
vi.mock("@/shared/utils/session", () => ({ getSessionId: vi.fn().mockReturnValue("sid") }));
vi.mock("@/shared/utils/customer", () => ({
  getLocalCustomer: () => ({ name: "", phone: "", address: "" }),
  saveLocalCustomer: vi.fn(),
}));

import { saveLocalCustomer } from "@/shared/utils/customer";
import axios from "@/shared/api/axios";

test("saves customer info", async () => {
  renderWithProviders(<LiteIdentityCard merchantId="m1" />);
  fireEvent.change(screen.getByLabelText(/الجوال/), { target: { value: "111" } });
  fireEvent.click(screen.getByText("حفظ"));
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  expect(saveLocalCustomer).toHaveBeenCalled();
});
