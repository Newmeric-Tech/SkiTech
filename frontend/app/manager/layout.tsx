import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
