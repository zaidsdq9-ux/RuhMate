import { LoadingScreen } from '@/components/loading/LoadingScreen';

export default function AuthLoading() {
  return <LoadingScreen subtitle="One moment" showReminder={false} />;
}
