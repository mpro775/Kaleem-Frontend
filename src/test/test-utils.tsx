import { type ReactNode } from "react";
import { render } from "@testing-library/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme/theme";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

type Options = {
  route?: string;
  auth?: { user?: any; token?: string | null };
};

export function renderWithProviders(ui: ReactNode, options: Options = {}) {
  const { route = "/" } = options;

  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{ui}</AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}
