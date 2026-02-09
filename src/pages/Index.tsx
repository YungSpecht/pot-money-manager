import { useAccountStore } from '@/hooks/useAccountStore';
import { SetupScreen } from '@/components/SetupScreen';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const store = useAccountStore();

  if (!store.data.setupComplete) {
    return <SetupScreen onComplete={store.completeSetup} />;
  }

  return <Dashboard {...store} />;
};

export default Index;
