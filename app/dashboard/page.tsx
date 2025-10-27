import type { Metadata } from "next";
import DashboardClient from "./DashboardPageClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <DashboardClient />;
}
