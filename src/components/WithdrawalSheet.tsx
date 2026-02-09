import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { AccountData, ScheduledWithdrawal } from '@/types/money-pots';
import { format, parseISO } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  data: AccountData;
  addWithdrawal: (w: Omit<ScheduledWithdrawal, 'id' | 'completed'>) => void;
  deleteWithdrawal: (id: string) => void;
}

export function WithdrawalSheet({ open, onClose, data, addWithdrawal, deleteWithdrawal }: Props) {
  const [potId, setPotId] = useState(data.pots[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('1');
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(true);

  const add = () => {
    if (!potId || !parseFloat(amount)) return;
    const dayNum = parseInt(day) || 1;
    const now = new Date();
    let next = new Date(now.getFullYear(), now.getMonth(), dayNum);
    if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, dayNum);
    addWithdrawal({ potId, amount: parseFloat(amount), dayOfMonth: dayNum, description: description || 'Withdrawal', recurring, nextDate: next.toISOString() });
    setAmount('');
    setDescription('');
  };

  const existing = data.scheduledWithdrawals.filter(w => !w.completed);

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Scheduled Withdrawals</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {/* Existing */}
          {existing.length > 0 && (
            <div className="space-y-2">
              {existing.map(w => (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium">{w.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.pots.find(p => p.id === w.potId)?.name} · Day {w.dayOfMonth} · {w.recurring ? 'Recurring' : 'One-time'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">€{w.amount.toFixed(2)}</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteWithdrawal(w.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium">Add New</p>
            <Select value={potId} onValueChange={setPotId}>
              <SelectTrigger><SelectValue placeholder="Select pot" /></SelectTrigger>
              <SelectContent>
                {data.pots.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" className="flex-1" />
              <Input type="number" placeholder="Day" value={day} onChange={e => setDay(e.target.value)} min={1} max={31} className="w-20" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">Recurring monthly</label>
              <Switch checked={recurring} onCheckedChange={setRecurring} />
            </div>
            <Button className="w-full" onClick={add} disabled={!potId || !parseFloat(amount)}>Add Withdrawal</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
