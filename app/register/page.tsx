import type { Metadata } from "next";
import RegisterPage from "./RegisterPageClient";

export const metadata: Metadata = {
  title: "Register",
};

export default function Page() {
  return <RegisterPage />;
}
