import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent} from '@/components/ui/card';
import {ArrowLeft, Pencil, Trash2, TrendingDown, TrendingUp, Wrench} from 'lucide-react';
import {Pot} from '@/types/money-pots';
import {format, parseISO} from 'date-fns';

interface PotDetailProps {
    pot: Pot;
    onBack: () => void;
    onUpdate: (name: string, balance: number) => void;
    onDelete: () => void;
}

const typeIcon = {
    deposit: <TrendingUp className="w-4 h-4 text-primary"/>,
    withdrawal: <TrendingDown className="w-4 h-4 text-destructive"/>,
    interest: <TrendingUp className="w-4 h-4 text-primary"/>,
    manual: <Wrench className="w-4 h-4 text-muted-foreground"/>,
};

export function PotDetail({pot, onBack, onUpdate, onDelete}: PotDetailProps) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(pot.name);
    const [balance, setBalance] = useState(pot.balance.toString());

    const save = () => {
        onUpdate(name.trim() || pot.name, parseFloat(balance) || pot.balance);
        setEditing(false);
    };

    return (
        <div className="min-h-screen">
            <div className="bg-primary text-primary-foreground px-5 pt-12 pb-8 rounded-b-3xl">
                <Button variant="ghost" size="sm"
                        className="text-primary-foreground hover:bg-primary-foreground/10 -ml-2 mb-4" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-1"/> Back
                </Button>
                {editing ? (
                    <div className="space-y-3">
                        <Input value={name} onChange={e => setName(e.target.value)}
                               className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"/>
                        <Input type="number" value={balance} onChange={e => setBalance(e.target.value)}
                               className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                               inputMode="decimal"/>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={save}
                                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">Save</Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold">{pot.name}</h1>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon"
                                        className="text-primary-foreground hover:bg-primary-foreground/10"
                                        onClick={() => setEditing(true)}>
                                    <Pencil className="w-4 h-4"/>
                                </Button>
                                <Button variant="ghost" size="icon"
                                        className="text-primary-foreground hover:bg-primary-foreground/10"
                                        onClick={onDelete}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                        <p className="text-3xl font-bold mt-2">€{pot.balance.toFixed(2)}</p>
                    </>
                )}
            </div>

            <div className="px-5 mt-4 space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">History</h2>
                {[...pot.history].reverse().map(entry => (
                    <Card key={entry.id}>
                        <CardContent className="flex items-center gap-3 py-3 px-4">
                            {typeIcon[entry.type]}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{entry.description}</p>
                                <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), 'dd MMM yyyy, HH:mm')}</p>
                            </div>
                            <span
                                className={`text-sm font-semibold ${entry.amount >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {entry.amount >= 0 ? '+' : ''}€{Math.abs(entry.amount).toFixed(2)}
              </span>
                        </CardContent>
                    </Card>
                ))}
                {pot.history.length === 0 &&
                    <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>}
            </div>
        </div>
    );
}
