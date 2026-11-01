import { LinkButton } from '../components/ui';
import { EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <EmptyState title="Sahifa topilmadi" description="Manzil noto‘g‘ri yoki sahifa ko‘chirilgan." />
      <LinkButton to="/" variant="primary">
        Bosh sahifaga qaytish
      </LinkButton>
    </div>
  );
}
