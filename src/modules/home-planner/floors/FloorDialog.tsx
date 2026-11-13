import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal } from '../../../components/ui';
import { DEFAULT_FLOOR_HEIGHT } from '../data/constants';
import type { Floor } from '../types';
import { validateFloorDraft, type Errors } from '../utils/validation';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Berilsa — tahrirlash, aks holda yangi qavat */
  floor?: Floor;
  /** Yangi qavat nomi bo‘sh bo‘lsa, navbatdagi raqam taklif qilinadi */
  suggestedName: string;
  onSave: (values: { name: string; height: number }) => void;
}

export default function FloorDialog({ open, onClose, floor, suggestedName, onSave }: Props) {
  const [name, setName] = useState('');
  const [height, setHeight] = useState(String(DEFAULT_FLOOR_HEIGHT));
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setName(floor ? floor.name : suggestedName);
    setHeight(String(floor ? floor.height : DEFAULT_FLOOR_HEIGHT));
  }, [open, floor, suggestedName]);

  const save = () => {
    const { errors: errs, values } = validateFloorDraft({ name, height });
    setErrors(errs);
    if (values) onSave(values);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={floor ? 'Qavatni tahrirlash' : 'Qavat qo‘shish'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={save}>Saqlash</Button>
        </>
      }
    >
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field id="fl-name" label="Qavat nomi" error={errors.name}>
          <Input id="fl-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field id="fl-height" label="Qavat balandligi (m)" error={errors.height} hint="Odatda 2,8 – 3,2 m">
          <Input id="fl-height" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
