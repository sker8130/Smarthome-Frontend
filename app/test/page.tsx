import type { Metadata } from "next";
import DashboardTestPage from "./testClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <DashboardTestPage />;
}
