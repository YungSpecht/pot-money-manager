import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {PiggyBank, Plus, Trash2} from 'lucide-react';

interface PotInput {
    name: string;
    balance: string;
}

interface SetupScreenProps {
    onComplete: (totalBalance: number, interestRate: number, pots: {
        name: string;
        balance: number
    }[], interestDate: string) => void;
}

export function SetupScreen({onComplete}: SetupScreenProps) {
    const [step, setStep] = useState(0);
    const [totalBalance, setTotalBalance] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [interestDate, setInterestDate] = useState('');
    const [pots, setPots] = useState<PotInput[]>([{name: '', balance: ''}]);

    const addPot = () => setPots(p => [...p, {name: '', balance: ''}]);
    const removePot = (i: number) => setPots(p => p.filter((_, idx) => idx !== i));
    const updatePot = (i: number, field: keyof PotInput, value: string) => {
        setPots(p => p.map((pot, idx) => idx === i ? {...pot, [field]: value} : pot));
    };

    const potTotal = pots.reduce((s, p) => s + (parseFloat(p.balance) || 0), 0);
    const balance = parseFloat(totalBalance) || 0;
    const overBudget = potTotal > balance;

    const handleSubmit = () => {
        const validPots = pots.filter(p => p.name.trim() && parseFloat(p.balance) >= 0);
        onComplete(balance, parseFloat(interestRate) || 0, validPots.map(p => ({
            name: p.name.trim(),
            balance: parseFloat(p.balance) || 0
        })), interestDate);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <PiggyBank className="w-8 h-8 text-primary"/>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Money Pots</h1>
                    <p className="text-muted-foreground text-sm">Set up your virtual sub-accounts</p>
                </div>

                {step === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Total Account Balance (€)</label>
                                <Input type="number" placeholder="0.00" value={totalBalance}
                                       onChange={e => setTotalBalance(e.target.value)} inputMode="decimal"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Annual Interest Rate (%)</label>
                                <Input type="number" placeholder="0.0" value={interestRate}
                                       onChange={e => setInterestRate(e.target.value)} inputMode="decimal" step="0.01"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interest Application Date</label>
                                <Input
                                    type="date"
                                    value={interestDate}
                                    onChange={e => setInterestDate(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={() => setStep(1)} disabled={!balance}>
                                Next
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Create Your Pots</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground">
                                Total: €{potTotal.toFixed(2)} / €{balance.toFixed(2)}
                                {overBudget && <span className="text-destructive ml-1">— exceeds balance!</span>}
                            </p>
                            {pots.map((pot, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-1">
                                        <Input placeholder="Pot name" value={pot.name}
                                               onChange={e => updatePot(i, 'name', e.target.value)}/>
                                    </div>
                                    <div className="w-28">
                                        <Input type="number" placeholder="0.00" value={pot.balance}
                                               onChange={e => updatePot(i, 'balance', e.target.value)}
                                               inputMode="decimal"/>
                                    </div>
                                    {pots.length > 1 && (
                                        <Button variant="ghost" size="icon" onClick={() => removePot(i)}>
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full" onClick={addPot}>
                                <Plus className="w-4 h-4 mr-1"/> Add Pot
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
                                <Button onClick={handleSubmit} disabled={overBudget || pots.every(p => !p.name.trim())}
                                        className="flex-1">
                                    Get Started
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
