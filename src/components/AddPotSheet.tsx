import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  open: boolean;
  onClose: () => void;
  addPot: (name: string, balance: number) => void;
}

export function AddPotSheet({ open, onClose, addPot }: Props) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  const add = () => {
    if (!name.trim()) return;
    addPot(name.trim(), parseFloat(balance) || 0);
    setName('');
    setBalance('');
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add New Pot</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pot Name</label>
            <Input placeholder="e.g. Car Insurance" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Starting Balance</label>
            <Input type="number" placeholder="0.00" value={balance} onChange={e => setBalance(e.target.value)} inputMode="decimal" />
          </div>
          <Button className="w-full" onClick={add} disabled={!name.trim()}>Add Pot</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
