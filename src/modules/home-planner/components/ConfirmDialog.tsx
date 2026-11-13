import { Button, Modal } from '../../../components/ui';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Xavfli amallar (o‘chirish) uchun tasdiqlash oynasi. */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'O‘chirish', onConfirm, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed">{message}</p>
    </Modal>
  );
}
