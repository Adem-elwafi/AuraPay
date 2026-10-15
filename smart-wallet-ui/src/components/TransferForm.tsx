import type { TransactionResponse } from "../api/types";
import QuickTransfer, { type Contact } from "../features/dashboard/QuickTransfer";

export interface TransferFormProps {
  onTransferSuccess?: (transaction: TransactionResponse) => void;
  onError?: (error: string) => void;
  contacts?: Contact[];
  balance?: number;
  initialMode?: "p2p" | "expense" | "deposit";
}

export function TransferForm({
  onTransferSuccess,
  contacts,
  balance,
  initialMode = "p2p",
}: TransferFormProps) {
  return (
    <QuickTransfer
      balance={balance}
      contacts={contacts}
      initialMode={initialMode}
      onTransferSuccess={(tx) => {
        if (tx && onTransferSuccess) {
          onTransferSuccess(tx);
        }
      }}
    />
  );
}

export default TransferForm;
