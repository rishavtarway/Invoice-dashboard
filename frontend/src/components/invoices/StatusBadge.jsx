const MAP = {
  Draft: 'bg-statusDraftBg text-statusDraft',
  Sent: 'bg-statusSentBg text-statusSent',
  Paid: 'bg-statusPaidBg text-statusPaid',
  Unpaid: 'bg-statusUnpaidBg text-statusUnpaid',
  Overdue: 'bg-statusOverdueBg text-statusOverdue',
  Void: 'bg-statusVoidBg text-statusVoid',
};

export default function StatusBadge({ status, className = '' }) {
  const styles = MAP[status] || 'bg-canvas text-inkSecondary';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles} ${className}`}
    >
      {status}
    </span>
  );
}
