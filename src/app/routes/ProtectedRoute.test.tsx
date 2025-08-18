import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import ProtectedRoute from "./ProtectedRoute";

function Secret() { return <div>لوحة التاجر</div>; }

test("يرفض الدخول بدون تسجيل", () => {
  renderWithProviders(<ProtectedRoute><Secret/></ProtectedRoute>, { auth: { user: null } });
  // توقّع ظهور شيء من صفحة الدخول أو عدم ظهور Secret
  expect(screen.queryByText("لوحة التاجر")).not.toBeInTheDocument();
});

test("يسمح بالدخول مع مستخدم", () => {
  const user = { id: "u1", role: "MERCHANT" };
  renderWithProviders(<ProtectedRoute><Secret/></ProtectedRoute>, { auth: { user } });
  expect(screen.getByText("لوحة التاجر")).toBeInTheDocument();
});
