function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg border border-gray-200">
        <h2 className="text-gray-900 text-lg font-bold mb-2">Are you sure?</h2>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;