import { EmptyState, LinkButton, PageHeader } from '../components/ui';

/** PHASE 5 da hamma ish turlarini (montaj, hisoblar, diagnostika, AI suhbatlar) jamlaydi. */
export default function Projects() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Loyihalarim" description="Barcha ishlaringiz bir joyda." />
      <EmptyState
        title="Jamlama keyingi bosqichda"
        description="Hozircha vizual montaj loyihalari o‘z bo‘limida saqlanadi. Birlashtirilgan ro‘yxat keyingi yangilanishda qo‘shiladi."
      />
      <div className="flex justify-center">
        <LinkButton to="/visual-montage" variant="primary">
          Vizual montaj loyihalariga o‘tish
        </LinkButton>
      </div>
    </div>
  );
}
