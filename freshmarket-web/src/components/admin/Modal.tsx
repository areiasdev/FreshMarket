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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon icon={IconX} size={20} />
          </button>
        </div>
        {children}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onSubmit} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
