import Icon from "../ui/Icon";
import { IconX } from "../ui/icons";


interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
}

export default function Modal({ title, children, onClose, onSubmit }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 dark:border dark:border-slate-700">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
            <Icon icon={IconX} size={20} />
          </button>
        </div>
        {children}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm btn-secondary">
            Cancelar
          </button>
          <button onClick={onSubmit} className="px-4 py-2 text-sm btn-primary">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
