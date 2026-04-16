import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
