import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AccountData } from '@/types/money-pots';

interface Props {
  open: boolean;
  onClose: () => void;
  data: AccountData;
  updateAccount: (total: number, rate: number) => void;
  resetAll: () => void;
}

export function SettingsSheet({ open, onClose, data, updateAccount, resetAll }: Props) {
  const [total, setTotal] = useState(data.totalBalance.toString());
  const [rate, setRate] = useState(data.interestRate.toString());

  useEffect(() => {
    if (open) {
      setTotal(data.totalBalance.toString());
      setRate(data.interestRate.toString());
    }
  }, [open, data]);

  const save = () => {
    updateAccount(parseFloat(total) || 0, parseFloat(rate) || 0);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Account Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Account Balance</label>
            <Input type="number" value={total} onChange={e => setTotal(e.target.value)} inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Annual Interest Rate (%)</label>
            <Input type="number" value={rate} onChange={e => setRate(e.target.value)} inputMode="decimal" step="0.01" />
          </div>
          <Button className="w-full" onClick={save}>Save Changes</Button>
          <Button variant="destructive" className="w-full" onClick={() => { resetAll(); onClose(); }}>
            Reset All Data
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
