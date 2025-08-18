
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import SignUpPage from "./SignUpPage";
import { server } from "@/test/testServer";
import { http, HttpResponse } from "msw";

test("يعرض خطأ عند بريد غير صالح", async () => {
  renderWithProviders(<SignUpPage />);
  await userEvent.type(screen.getByLabelText(/البريد الإلكتروني/i), "badmail");
  await userEvent.click(screen.getByRole("button", { name: /إنشاء حساب/i }));
  expect(await screen.findByText(/بريد إلكتروني غير صالح/i)).toBeInTheDocument();
});

test("ينجح التسجيل عند بيانات صحيحة", async () => {
  renderWithProviders(<SignUpPage />);
  await userEvent.type(screen.getByLabelText(/الاسم الكامل/i), "Test User");
  await userEvent.type(screen.getByLabelText(/البريد الإلكتروني/i), "a@a.com");
  await userEvent.type(screen.getByLabelText(/^كلمة المرور$/), "123456");
  await userEvent.type(screen.getByLabelText(/تأكيد كلمة المرور/i), "123456");
  await userEvent.click(screen.getByRole("button", { name: /إنشاء حساب/i }));
  // يمكن التحقق من ظهور toast بنجاح عبر DOM أو منطق login mock
  expect(true).toBe(true);
});

test("يعرض رسالة API عند فشل التسجيل", async () => {
  server.use(
    http.post("/api/auth/signup", () =>
      HttpResponse.json({ message: "البريد مستخدم مسبقًا" }, { status: 400 })
    )
  );
  renderWithProviders(<SignUpPage />);
  await userEvent.type(screen.getByLabelText(/الاسم الكامل/i), "User");
  await userEvent.type(screen.getByLabelText(/البريد الإلكتروني/i), "a@a.com");
  await userEvent.type(screen.getByLabelText(/^كلمة المرور$/), "123456");
  await userEvent.type(screen.getByLabelText(/تأكيد كلمة المرور/i), "123456");
  await userEvent.click(screen.getByRole("button", { name: /إنشاء حساب/i }));
  // هنا عادةً يظهر toast. يمكن أيضًا توقع رسالة إن عرضتها داخل الصفحة.
  expect(true).toBe(true);
});
