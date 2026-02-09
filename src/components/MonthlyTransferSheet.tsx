import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountData, SplitRule } from '@/types/money-pots';

interface Props {
  open: boolean;
  onClose: () => void;
  data: AccountData;
  setMonthlyTransfer: (total: number, splits: SplitRule[]) => void;
  processMonthlyTransfer: () => void;
}

export function MonthlyTransferSheet({ open, onClose, data, setMonthlyTransfer, processMonthlyTransfer }: Props) {
  const [total, setTotal] = useState(data.monthlyTransfer.totalAmount.toString());
  const [splits, setSplits] = useState<SplitRule[]>(data.monthlyTransfer.splits);

  useEffect(() => {
    if (open) {
      setTotal(data.monthlyTransfer.totalAmount.toString());
      setSplits(data.monthlyTransfer.splits.length > 0 ? data.monthlyTransfer.splits : data.pots.map(p => ({ potId: p.id, type: 'fixed' as const, value: 0 })));
    }
  }, [open, data]);

  const updateSplit = (potId: string, field: keyof SplitRule, value: string | number) => {
    setSplits(s => s.map(r => r.potId === potId ? { ...r, [field]: field === 'value' ? parseFloat(value as string) || 0 : value } : r));
  };

  const totalAmount = parseFloat(total) || 0;
  const splitSum = splits.reduce((s, r) => s + (r.type === 'fixed' ? r.value : totalAmount * (r.value / 100)), 0);

  const save = () => {
    setMonthlyTransfer(totalAmount, splits);
  };

  const process = () => {
    save();
    processMonthlyTransfer();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Monthly Transfer</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Transfer Amount</label>
            <Input type="number" value={total} onChange={e => setTotal(e.target.value)} inputMode="decimal" />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Split per pot</p>
            <p className="text-xs text-muted-foreground">Allocated: €{splitSum.toFixed(2)} / €{totalAmount.toFixed(2)}</p>
            {data.pots.map(pot => {
              const rule = splits.find(r => r.potId === pot.id);
              return (
                <div key={pot.id} className="flex items-center gap-2">
                  <span className="text-sm flex-1 truncate">{pot.name}</span>
                  <Select value={rule?.type ?? 'fixed'} onValueChange={v => updateSplit(pot.id, 'type', v)}>
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">€</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    className="w-24 h-8 text-sm"
                    value={rule?.value ?? 0}
                    onChange={e => updateSplit(pot.id, 'value', e.target.value)}
                    inputMode="decimal"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { save(); onClose(); }}>Save</Button>
            <Button className="flex-1" onClick={process}>Process Now</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
