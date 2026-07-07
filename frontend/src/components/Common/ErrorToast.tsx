interface Props {
  message: string;
  onClose?: () => void;
}

export default function ErrorToast({ message, onClose }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300 backdrop-blur-xl">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-red-300/70 hover:text-red-200">
          ✕
        </button>
      )}
    </div>
  );
}
