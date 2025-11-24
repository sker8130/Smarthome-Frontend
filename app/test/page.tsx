import type { Metadata } from "next";
import FigmaDashboard from "./testClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <FigmaDashboard />;
}
