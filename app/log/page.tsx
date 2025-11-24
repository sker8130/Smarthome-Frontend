import type { Metadata } from "next";
import LogPageClient from "./LogPageClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <LogPageClient />;
}
