import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal, Select } from '../../../components/ui';
import { HOUSE_TYPES } from '../data/constants';
import type { HouseType, Project } from '../types';
import { validateProjectDraft, type Errors, type ProjectDraft } from '../utils/validation';
import { createProject } from '../utils/factory';
import { useProjectStore } from '../store/ProjectStore';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Berilsa — tahrirlash rejimi, aks holda yangi loyiha */
  project?: Project;
  /** Yangi loyiha yaratilgandan keyin */
  onCreated?: (projectId: string) => void;
}

const emptyDraft = (): ProjectDraft => ({
  name: '',
  houseType: 'house',
  description: '',
  dimLength: '',
  dimWidth: '',
  floorCount: '1',
});

export default function ProjectFormDialog({ open, onClose, project, onCreated }: Props) {
  const store = useProjectStore();
  const editing = Boolean(project);
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setDraft(
      project
        ? {
            name: project.name,
            houseType: project.houseType,
            description: project.description,
            dimLength: project.dimensions ? String(project.dimensions.length) : '',
            dimWidth: project.dimensions ? String(project.dimensions.width) : '',
            floorCount: String(project.floors.length),
          }
        : emptyDraft(),
    );
  }, [open, project]);

  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const save = () => {
    const { errors: errs, values, dims } = validateProjectDraft(draft);
    setErrors(errs);
    if (!values) return;
    if (editing && project) {
      store.updateProject(project.id, {
        name: values.name,
        houseType: values.houseType,
        description: values.description,
        dimensions: dims,
      });
      onClose();
      return;
    }
    const created = createProject({
      name: values.name,
      houseType: values.houseType as HouseType,
      description: values.description,
      dimensions: dims,
      floorCount: Number(values.floorCount),
    });
    store.addProject(created);
    onClose();
    onCreated?.(created.id);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Loyihani tahrirlash' : 'Yangi loyiha'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={save}>{editing ? 'Saqlash' : 'Loyiha yaratish'}</Button>
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
        <Field id="pf-name" label="Loyiha nomi" error={errors.name}>
          <Input id="pf-name" value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="masalan, Toshkent uyi" autoFocus />
        </Field>
        <Field id="pf-type" label="Uy turi">
          <Select id="pf-type" value={draft.houseType} onChange={(e) => set('houseType', e.target.value as HouseType)}>
            {HOUSE_TYPES.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="pf-dl" label="Umumiy uzunlik (m)" error={errors.dimLength} hint="Ixtiyoriy">
            <Input id="pf-dl" inputMode="decimal" value={draft.dimLength} onChange={(e) => set('dimLength', e.target.value)} />
          </Field>
          <Field id="pf-dw" label="Umumiy kenglik (m)" error={errors.dimWidth} hint="Ixtiyoriy">
            <Input id="pf-dw" inputMode="decimal" value={draft.dimWidth} onChange={(e) => set('dimWidth', e.target.value)} />
          </Field>
        </div>
        {!editing && (
          <Field id="pf-floors" label="Qavatlar soni" error={errors.floorCount} hint="Keyinroq qavat qo‘shish mumkin">
            <Input id="pf-floors" inputMode="numeric" value={draft.floorCount} onChange={(e) => set('floorCount', e.target.value)} />
          </Field>
        )}
        <Field id="pf-desc" label="Izoh" error={errors.description}>
          <textarea
            id="pf-desc"
            rows={3}
            value={draft.description}
            onChange={(e) => set('description', e.target.value)}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </Field>
      </form>
    </Modal>
  );
}
