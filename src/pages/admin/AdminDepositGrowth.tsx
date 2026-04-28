import { AdminGrowthMetricsPage } from "@/components/admin/AdminGrowthMetricsPage";

/** Admin dashboard: finished fiat deposit aggregates by day/week/month buckets. */
const AdminDepositGrowth = () => (
  <AdminGrowthMetricsPage
    apiPath="/admin/growth/deposits"
    pageTitleKey="admin.depositGrowth"
  />
);

export default AdminDepositGrowth;
