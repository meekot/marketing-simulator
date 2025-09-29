import { type PropsWithChildren, type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  footer?: ReactNode;
}

const modalRootId = 'marketing-simulator-modal-root';

const ensureModalRoot = (): HTMLElement => {
  let root = document.getElementById(modalRootId);
  if (!root) {
    root = document.createElement('div');
    root.setAttribute('id', modalRootId);
    document.body.appendChild(root);
  }
  return root;
};

export const Modal = ({
  open,
  title,
  onClose,
  footer,
  children,
}: PropsWithChildren<ModalProps>) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', onKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-950/95 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            aria-label="Fermer la fenêtre"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4 text-sm text-slate-600">
          {children}
        </div>
        {footer && (
          <div className="border-t border-slate-200 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );

  return createPortal(content, ensureModalRoot());
};

export default Modal;
