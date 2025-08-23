import { screen, fireEvent, waitFor } from "@testing-library/react";
import CustomerInfoForm from "./CustomerInfoForm";
import { renderWithProviders } from "@/test/test-utils";
import { vi } from "vitest";

vi.mock("@/shared/api/axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({}),
  },
}));

test("submits customer info", async () => {
  vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("uuid");
  const onComplete = vi.fn();
  renderWithProviders(<CustomerInfoForm merchantId="m1" onComplete={onComplete} />);
  fireEvent.change(screen.getByLabelText(/الاسم/), { target: { value: "Ali" } });
  fireEvent.change(screen.getByLabelText(/رقم الجوال/), { target: { value: "123" } });
  fireEvent.change(screen.getByLabelText(/العنوان/), { target: { value: "Street" } });
  fireEvent.click(screen.getByRole("button", { name: "متابعة" }));
  await waitFor(() =>
    expect(onComplete).toHaveBeenCalledWith({ name: "Ali", phone: "123", address: "Street" })
  );
});
