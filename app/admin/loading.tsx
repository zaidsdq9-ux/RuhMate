import { LoadingScreen } from '@/components/loading/LoadingScreen';

export default function AdminLoading() {
  return <LoadingScreen subtitle="Loading admin panel" showReminder={false} />;
}
