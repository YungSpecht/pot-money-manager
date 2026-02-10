import {useAccountStore} from '@/hooks/useAccountStore';
import {SetupScreen} from '@/components/SetupScreen';
import {Dashboard} from '@/components/Dashboard';
import {useEffect} from 'react';

const Index = () => {
    const store = useAccountStore();

    useEffect(() => {
        if (store.data.setupComplete) {
            store.triggerMonthlyTransferIfDue();
        }
    }, [store]);

    if (!store.data.setupComplete) {
        return <SetupScreen onComplete={store.completeSetup}/>;
    }

    return <Dashboard {...store} />;
};

export default Index;
