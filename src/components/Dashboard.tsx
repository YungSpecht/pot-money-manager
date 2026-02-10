import {useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {ArrowDownUp, Calendar, PiggyBank, Plus, Settings, Wallet} from 'lucide-react';
import {AccountData, ScheduledWithdrawal, SplitRule} from '@/types/money-pots';
import {PotDetail} from './PotDetail';
import {MonthlyTransferSheet} from './MonthlyTransferSheet';
import {WithdrawalSheet} from './WithdrawalSheet';
import {SettingsSheet} from './SettingsSheet';
import {AddPotSheet} from './AddPotSheet';
import {format, isPast, parseISO} from 'date-fns';

interface DashboardProps {
    data: AccountData;
    getAllocated: () => number;
    getUnallocated: () => number;
    updateAccount: (total: number, rate: number) => void;
    addPot: (name: string, balance: number) => void;
    updatePot: (id: string, name: string, balance: number) => void;
    deletePot: (id: string) => void;
    setMonthlyTransfer: (total: number, splits: SplitRule[]) => void;
    processMonthlyTransfer: () => void;
    addWithdrawal: (w: Omit<ScheduledWithdrawal, 'id' | 'completed'>) => void;
    deleteWithdrawal: (id: string) => void;
    processWithdrawal: (id: string) => void;
    resetAll: () => void;
    setLastMonthlyTransferDate: (date: string) => void;
}

export function Dashboard(props: DashboardProps) {
    const {data, getAllocated, getUnallocated} = props;
    const [selectedPot, setSelectedPot] = useState<string | null>(null);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showWithdrawals, setShowWithdrawals] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddPot, setShowAddPot] = useState(false);

    const allocated = getAllocated();
    const unallocated = getUnallocated();
    const allocPercent = data.totalBalance > 0 ? (allocated / data.totalBalance) * 100 : 0;

    const upcomingWithdrawals = data.scheduledWithdrawals
        .filter(w => !w.completed)
        .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
        .slice(0, 5);

    const pot = data.pots.find(p => p.id === selectedPot);

    if (pot) {
        return (
            <PotDetail
                pot={pot}
                onBack={() => setSelectedPot(null)}
                onUpdate={(name, balance) => {
                    props.updatePot(pot.id, name, balance);
                }}
                onDelete={() => {
                    props.deletePot(pot.id);
                    setSelectedPot(null);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-5 pt-12 pb-8 rounded-b-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <PiggyBank className="w-6 h-6"/>
                        <span className="font-bold text-lg">Money Pots</span>
                    </div>
                    <Button variant="ghost" size="icon"
                            className="text-primary-foreground hover:bg-primary-foreground/10"
                            onClick={() => setShowSettings(true)}>
                        <Settings className="w-5 h-5"/>
                    </Button>
                </div>
                <p className="text-primary-foreground/70 text-xs uppercase tracking-wider mb-1">Total Balance</p>
                <p className="text-3xl font-bold tracking-tight">€{data.totalBalance.toFixed(2)}</p>
                <p className="text-primary-foreground/60 text-xs mt-1">{data.interestRate}% p.a. interest</p>
            </div>

            <div className="px-5 -mt-4 space-y-4">
                {/* Allocation bar */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>Allocated: €{allocated.toFixed(2)}</span>
                            <span>Free: €{unallocated.toFixed(2)}</span>
                        </div>
                        <Progress value={allocPercent} className="h-2"/>
                    </CardContent>
                </Card>

                {/* Quick actions */}
                <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => setShowTransfer(true)}>
                        <ArrowDownUp className="w-4 h-4 mr-1"/> Monthly Transfer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddPot(true)}>
                        <Plus className="w-4 h-4"/>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowWithdrawals(true)}>
                        <Calendar className="w-4 h-4"/>
                    </Button>
                </div>

                {/* Pots */}
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your
                        Pots</h2>
                    <div className="space-y-2">
                        {data.pots.map(p => {
                            const pct = data.totalBalance > 0 ? (p.balance / data.totalBalance) * 100 : 0;
                            return (
                                <Card key={p.id}
                                      className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                                      onClick={() => setSelectedPot(p.id)}>
                                    <CardContent className="flex items-center gap-3 py-3 px-4">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Wallet className="w-5 h-5 text-primary"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{p.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Progress value={pct} className="h-1.5 flex-1"/>
                                                <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-sm">€{p.balance.toFixed(2)}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {data.pots.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">No pots yet. Tap + to add
                                one.</p>
                        )}
                    </div>
                </div>

                {/* Upcoming withdrawals */}
                {upcomingWithdrawals.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h2>
                        <div className="space-y-2">
                            {upcomingWithdrawals.map(w => {
                                const potName = data.pots.find(p => p.id === w.potId)?.name ?? 'Unknown';
                                const due = isPast(parseISO(w.nextDate));
                                return (
                                    <Card key={w.id} className={due ? 'border-destructive/50' : ''}>
                                        <CardContent className="flex items-center justify-between py-3 px-4">
                                            <div>
                                                <p className="font-medium text-sm">{w.description}</p>
                                                <p className="text-xs text-muted-foreground">{potName} · {format(parseISO(w.nextDate), 'dd MMM yyyy')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="font-semibold text-sm text-destructive">-€{w.amount.toFixed(2)}</span>
                                                {due && (
                                                    <Button size="sm" variant="destructive"
                                                            onClick={() => props.processWithdrawal(w.id)}>Due</Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Sheets */}
            <MonthlyTransferSheet
                open={showTransfer}
                onClose={() => setShowTransfer(false)}
                data={data}
                setMonthlyTransfer={props.setMonthlyTransfer}
                processMonthlyTransfer={props.processMonthlyTransfer}
                setLastTransferDate={props.setLastMonthlyTransferDate}
            />
            <WithdrawalSheet
                open={showWithdrawals}
                onClose={() => setShowWithdrawals(false)}
                data={data}
                addWithdrawal={props.addWithdrawal}
                deleteWithdrawal={props.deleteWithdrawal}
            />
            <SettingsSheet
                open={showSettings}
                onClose={() => setShowSettings(false)}
                data={data}
                updateAccount={props.updateAccount}
                resetAll={props.resetAll}
            />
            <AddPotSheet
                open={showAddPot}
                onClose={() => setShowAddPot(false)}
                addPot={props.addPot}
            />
        </div>
    );
}
