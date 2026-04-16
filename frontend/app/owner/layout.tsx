import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
