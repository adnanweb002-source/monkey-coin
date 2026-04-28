import { AdminGrowthMetricsPage } from "@/components/admin/AdminGrowthMetricsPage";

/** Admin dashboard: package purchase amount aggregates by day/week/month buckets. */
const AdminPackagePurchaseGrowth = () => (
  <AdminGrowthMetricsPage
    apiPath="/admin/growth/package-purchases"
    pageTitleKey="admin.packagePurchaseGrowth"
  />
);

export default AdminPackagePurchaseGrowth;
