import { useMemo, useState } from 'react';
import { Card, Field, Input, PageHeader, Select } from '../components/ui';
import { currentFromPU, electricityCost, energyKwh, fmt, ohmsLaw, powerFromUI, type Result } from '../lib/calculators';

function ResultBox({ result, unit, label }: { result: Result | null; unit: string; label: string }) {
  if (!result) {
    return <p className="rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-muted)]">Qiymatlarni kiriting</p>;
  }
  if (!result.ok) {
    return (
      <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
        {result.error}
      </p>
    );
  }
  return (
    <div className="rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-500/15" aria-live="polite">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-2xl font-semibold text-brand-700 dark:text-brand-100">
        {fmt(result.value)} <span className="text-base font-medium">{unit}</span>
      </p>
    </div>
  );
}

function Formula({ children }: { children: string }) {
  return <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 font-mono text-sm">{children}</p>;
}

function OhmCalc() {
  const [target, setTarget] = useState<'U' | 'I' | 'R'>('U');
  const [u, setU] = useState('');
  const [i, setI] = useState('');
  const [r, setR] = useState('');

  const result = useMemo<Result | null>(() => {
    const needed = target === 'U' ? [i, r] : target === 'I' ? [u, r] : [u, i];
    if (needed.some((v) => v.trim() === '')) return null;
    return ohmsLaw(target, u, i, r);
  }, [target, u, i, r]);

  const unit = target === 'U' ? 'V' : target === 'I' ? 'A' : 'Ω';
  const label = target === 'U' ? 'Kuchlanish U' : target === 'I' ? 'Tok I' : 'Qarshilik R';

  return (
    <Card as="section" className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Om qonuni</h2>
        <Formula>U = I × R</Formula>
      </div>
      <Field id="ohm-target" label="Topiladigan qiymat">
        <Select id="ohm-target" value={target} onChange={(e) => setTarget(e.target.value as 'U' | 'I' | 'R')}>
          <option value="U">Kuchlanish (U, V)</option>
          <option value="I">Tok (I, A)</option>
          <option value="R">Qarshilik (R, Ω)</option>
        </Select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field id="ohm-u" label="U (V)" hint={target === 'U' ? 'Hisoblanadi' : undefined}>
          <Input id="ohm-u" inputMode="decimal" disabled={target === 'U'} value={target === 'U' ? '' : u} onChange={(e) => setU(e.target.value)} placeholder="220" />
        </Field>
        <Field id="ohm-i" label="I (A)" hint={target === 'I' ? 'Hisoblanadi' : undefined}>
          <Input id="ohm-i" inputMode="decimal" disabled={target === 'I'} value={target === 'I' ? '' : i} onChange={(e) => setI(e.target.value)} placeholder="5" />
        </Field>
        <Field id="ohm-r" label="R (Ω)" hint={target === 'R' ? 'Hisoblanadi' : undefined}>
          <Input id="ohm-r" inputMode="decimal" disabled={target === 'R'} value={target === 'R' ? '' : r} onChange={(e) => setR(e.target.value)} placeholder="44" />
        </Field>
      </div>
      <ResultBox result={result} unit={unit} label={label} />
    </Card>
  );
}

function PowerCalc() {
  const [u, setU] = useState('220');
  const [i, setI] = useState('');
  const result = useMemo<Result | null>(() => (i.trim() === '' ? null : powerFromUI(u, i)), [u, i]);
  return (
    <Card as="section" className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Elektr quvvati</h2>
        <Formula>P = U × I</Formula>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="pw-u" label="Kuchlanish U (V)">
          <Input id="pw-u" inputMode="decimal" value={u} onChange={(e) => setU(e.target.value)} />
        </Field>
        <Field id="pw-i" label="Tok I (A)">
          <Input id="pw-i" inputMode="decimal" value={i} onChange={(e) => setI(e.target.value)} placeholder="4.5" />
        </Field>
      </div>
      <ResultBox result={result} unit="W" label="Quvvat P" />
    </Card>
  );
}

function CurrentCalc() {
  const [p, setP] = useState('');
  const [u, setU] = useState('220');
  const result = useMemo<Result | null>(() => (p.trim() === '' ? null : currentFromPU(p, u)), [p, u]);
  return (
    <Card as="section" className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Tok (taxminiy)</h2>
        <Formula>I = P / U</Formula>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Bu oddiy bir fazali taxmin (quvvat koeffitsiyenti hisobga olinmagan). Kabel va avtomat tanlash uchun mutaxassis bilan maslahatlashing.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="cu-p" label="Quvvat P (W)">
          <Input id="cu-p" inputMode="decimal" value={p} onChange={(e) => setP(e.target.value)} placeholder="2200" />
        </Field>
        <Field id="cu-u" label="Kuchlanish U (V)">
          <Input id="cu-u" inputMode="decimal" value={u} onChange={(e) => setU(e.target.value)} />
        </Field>
      </div>
      <ResultBox result={result} unit="A" label="Tok I" />
    </Card>
  );
}

function EnergyCalc() {
  const [p, setP] = useState('');
  const [h, setH] = useState('');
  const [tariff, setTariff] = useState('');

  const energy = useMemo<Result | null>(() => (p.trim() === '' || h.trim() === '' ? null : energyKwh(p, h)), [p, h]);
  const cost = useMemo<Result | null>(() => {
    if (!energy || !energy.ok || tariff.trim() === '') return null;
    return electricityCost(energy.value, tariff);
  }, [energy, tariff]);

  return (
    <Card as="section" className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">Energiya sarfi va narx</h2>
        <Formula>E (kVt·soat) = P (W) × soat ÷ 1000</Formula>
        <p className="mt-2 text-xs text-[var(--text-muted)]">Narx: E × tarif (so‘m/kVt·soat). Tarif ixtiyoriy — o‘z hisob-kitobingizga qarab kiriting.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field id="en-p" label="Quvvat P (W)">
          <Input id="en-p" inputMode="decimal" value={p} onChange={(e) => setP(e.target.value)} placeholder="1000" />
        </Field>
        <Field id="en-h" label="Ishlash vaqti (soat)">
          <Input id="en-h" inputMode="decimal" value={h} onChange={(e) => setH(e.target.value)} placeholder="3" />
        </Field>
        <Field id="en-t" label="Tarif (so‘m/kVt·soat)" hint="Ixtiyoriy">
          <Input id="en-t" inputMode="decimal" value={tariff} onChange={(e) => setTariff(e.target.value)} placeholder="masalan, 800" />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox result={energy} unit="kVt·soat" label="Energiya" />
        <ResultBox result={cost} unit="so‘m" label="Taxminiy narx" />
      </div>
    </Card>
  );
}

export default function Calculators() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Elektr kalkulyatorlari" description="Formulalar, birliklar va tekshiriladigan kiritish bilan oddiy hisob-kitoblar." />
      <div className="grid gap-6 lg:grid-cols-2">
        <OhmCalc />
        <PowerCalc />
        <CurrentCalc />
        <EnergyCalc />
      </div>
    </div>
  );
}
