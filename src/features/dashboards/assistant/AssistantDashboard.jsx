import DashboardShell from '../../../shared/layouts/DashboardShell';
import { useAssistantNav } from '../../../shared/hooks/useAssistantNav';
import LoadingScreen from '../../../shared/ui/LoadingScreen';

export default function AssistantDashboard() {
  const { navItems, loading } = useAssistantNav();

  if (loading) return <LoadingScreen />;

  return <DashboardShell titleKey="dashboard.assistant" navItems={navItems} />;
}
