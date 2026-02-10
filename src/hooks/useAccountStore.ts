import {useCallback, useEffect, useState} from 'react';
import {AccountData, defaultAccountData, ScheduledWithdrawal, SplitRule} from '@/types/money-pots';

const STORAGE_KEY = 'money-pots-data';

function load(): AccountData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return {...defaultAccountData, ...JSON.parse(raw)};
    } catch {
    }
    return {...defaultAccountData};
}

function save(data: AccountData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

export function useAccountStore() {
    const [data, setData] = useState<AccountData>(load);

    useEffect(() => {
        save(data);
    }, [data]);

    const update = useCallback((fn: (d: AccountData) => AccountData) => {
        setData(prev => fn({...prev}));
    }, []);

    const getAllocated = useCallback(() => {
        return data.pots.reduce((s, p) => s + p.balance, 0);
    }, [data.pots]);

    const getUnallocated = useCallback(() => {
        return data.totalBalance - getAllocated();
    }, [data.totalBalance, getAllocated]);

    // Setup
    const completeSetup = useCallback((totalBalance: number, interestRate: number, pots: {
        name: string;
        balance: number
    }[]) => {
        update(d => ({
            ...d,
            totalBalance,
            interestRate,
            pots: pots.map(p => ({
                id: uid(),
                name: p.name,
                balance: p.balance,
                history: [{
                    id: uid(),
                    date: new Date().toISOString(),
                    type: 'manual' as const,
                    amount: p.balance,
                    description: 'Initial balance'
                }]
            })),
            setupComplete: true,
        }));
    }, [update]);

    // Account settings
    const updateAccount = useCallback((totalBalance: number, interestRate: number) => {
        update(d => ({...d, totalBalance, interestRate}));
    }, [update]);

    // Pots
    const addPot = useCallback((name: string, balance: number) => {
        update(d => ({
            ...d,
            totalBalance: d.totalBalance + balance,
            pots: [...d.pots, {
                id: uid(),
                name,
                balance,
                history: [{
                    id: uid(),
                    date: new Date().toISOString(),
                    type: 'manual' as const,
                    amount: balance,
                    description: 'Initial balance'
                }]
            }],
        }));
    }, [update]);

    const updatePot = useCallback((potId: string, name: string, balance: number) => {
        update(d => {
            const pot = d.pots.find(p => p.id === potId);
            if (!pot) return d;
            const diff = balance - pot.balance;
            return {
                ...d,
                totalBalance: d.totalBalance + diff,
                pots: d.pots.map(p => p.id === potId ? {
                    ...p,
                    name,
                    balance,
                    history: [...p.history, {
                        id: uid(),
                        date: new Date().toISOString(),
                        type: 'manual' as const,
                        amount: diff,
                        description: 'Balance adjusted'
                    }]
                } : p),
            };
        });
    }, [update]);

    const deletePot = useCallback((potId: string) => {
        update(d => ({
            ...d,
            pots: d.pots.filter(p => p.id !== potId),
            monthlyTransfer: {...d.monthlyTransfer, splits: d.monthlyTransfer.splits.filter(s => s.potId !== potId)},
            scheduledWithdrawals: d.scheduledWithdrawals.filter(w => w.potId !== potId),
        }));
    }, [update]);

    // Monthly transfer
    const setMonthlyTransfer = useCallback((totalAmount: number, splits: SplitRule[]) => {
        update(d => ({...d, monthlyTransfer: {totalAmount, splits}}));
    }, [update]);

    const processMonthlyTransfer = useCallback(() => {
        update(d => {
            const {totalAmount, splits} = d.monthlyTransfer;
            if (totalAmount <= 0) return d;
            const now = new Date().toISOString();
            let newPots = [...d.pots.map(p => ({...p, history: [...p.history]}))];

            for (const split of splits) {
                const pot = newPots.find(p => p.id === split.potId);
                if (!pot) continue;
                const amount = split.type === 'fixed' ? split.value : totalAmount * (split.value / 100);
                pot.balance += amount;
                pot.history.push({id: uid(), date: now, type: 'deposit', amount, description: 'Monthly transfer'});
            }

            // Apply interest
            const monthlyRate = d.interestRate / 100 / 12;
            for (const pot of newPots) {
                const interest = pot.balance * monthlyRate;
                if (interest > 0) {
                    pot.balance += interest;
                    pot.history.push({
                        id: uid(),
                        date: now,
                        type: 'interest',
                        amount: interest,
                        description: `Interest (${d.interestRate}% p.a.)`
                    });
                }
            }

            const newTotal = d.totalBalance + totalAmount + newPots.reduce((s, p) => {
                const interestEntry = p.history.filter(h => h.date === now && h.type === 'interest');
                return s + interestEntry.reduce((a, e) => a + e.amount, 0);
            }, 0);

            return {...d, pots: newPots, totalBalance: newTotal, lastInterestDate: now};
        });
    }, [update]);

    // Scheduled withdrawals
    const addWithdrawal = useCallback((w: Omit<ScheduledWithdrawal, 'id' | 'completed'>) => {
        update(d => ({
            ...d,
            scheduledWithdrawals: [...d.scheduledWithdrawals, {...w, id: uid(), completed: false}],
        }));
    }, [update]);

    const deleteWithdrawal = useCallback((id: string) => {
        update(d => ({
            ...d,
            scheduledWithdrawals: d.scheduledWithdrawals.filter(w => w.id !== id),
        }));
    }, [update]);

    const processWithdrawal = useCallback((id: string) => {
        update(d => {
            const w = d.scheduledWithdrawals.find(x => x.id === id);
            if (!w) return d;
            const now = new Date().toISOString();
            return {
                ...d,
                totalBalance: d.totalBalance - w.amount,
                pots: d.pots.map(p => p.id === w.potId ? {
                    ...p,
                    balance: p.balance - w.amount,
                    history: [...p.history, {
                        id: uid(),
                        date: now,
                        type: 'withdrawal' as const,
                        amount: -w.amount,
                        description: w.description
                    }],
                } : p),
                scheduledWithdrawals: w.recurring
                    ? d.scheduledWithdrawals.map(x => x.id === id ? {...x, nextDate: getNextDate(x.dayOfMonth)} : x)
                    : d.scheduledWithdrawals.map(x => x.id === id ? {...x, completed: true} : x),
            };
        });
    }, [update]);

    const resetAll = useCallback(() => {
        setData({...defaultAccountData});
    }, []);

    return {
        data, getAllocated, getUnallocated,
        completeSetup, updateAccount,
        addPot, updatePot, deletePot,
        setMonthlyTransfer, processMonthlyTransfer,
        addWithdrawal, deleteWithdrawal, processWithdrawal,
        resetAll,
    };
}

function getNextDate(dayOfMonth: number): string {
    const now = new Date();
    let next = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(dayOfMonth, 28));
    if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 2, Math.min(dayOfMonth, 28));
    return next.toISOString();
}
