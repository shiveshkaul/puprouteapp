import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaX, FaDownload, FaEye } from "react-icons/fa6";
import { BillingTransactionDisplay } from "@/types/settings";

interface BillingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: BillingTransactionDisplay[];
}

export const BillingHistoryModal = ({ isOpen, onClose, transactions }: BillingHistoryModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-heading text-primary">Billing History</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full p-2"
                >
                  <FaX className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💳</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">Your billing history will appear here once you make your first booking.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-gray-900">{transaction.amount}</span>
                          
                          {transaction.receipt_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(transaction.receipt_url, '_blank')}
                              className="p-2"
                            >
                              <FaDownload className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {transactions.length > 0 && (
                  <Button 
                    variant="default"
                    onClick={() => {
                      // Export functionality could go here
                      alert("Export feature coming soon!");
                    }}
                  >
                    <FaDownload className="mr-2 w-4 h-4" />
                    Export All
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
