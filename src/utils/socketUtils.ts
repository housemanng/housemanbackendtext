// WebSocket utility functions for real-time updates

interface WalletUpdateData {
  userId?: string;
  companyId?: string;
  balance: number;
  transactionType: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceCode: string;
}

interface HousemanWalletUpdateData {
  balance: number;
  totalCredits: number;
  totalDebits: number;
  totalProcessed: number;
  transactionType: 'credit' | 'debit';
  amount: number;
  description: string;
}

// Send wallet update to specific user
export const sendWalletUpdateToUser = (userId: string, data: WalletUpdateData) => {
  try {
    if (global.io) {
      global.io.to(`user-${userId}`).emit('wallet-updated', {
        type: 'wallet-update',
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 Wallet update sent to user ${userId}:`, data);
    }
  } catch (error) {
    console.error('Error sending wallet update to user:', error);
  }
};

// Send wallet update to specific company
export const sendWalletUpdateToCompany = (companyId: string, data: WalletUpdateData) => {
  try {
    if (global.io) {
      global.io.to(`company-${companyId}`).emit('wallet-updated', {
        type: 'wallet-update',
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 Wallet update sent to company ${companyId}:`, data);
    }
  } catch (error) {
    console.error('Error sending wallet update to company:', error);
  }
};

// Send HousemanWallet update to all admins
export const sendHousemanWalletUpdateToAdmins = (data: HousemanWalletUpdateData) => {
  try {
    if (global.io) {
      global.io.to('admin-room').emit('houseman-wallet-updated', {
        type: 'houseman-wallet-update',
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 HousemanWallet update sent to admins:`, data);
    }
  } catch (error) {
    console.error('Error sending HousemanWallet update to admins:', error);
  }
};

// Send transaction notification to admins
export const sendTransactionNotificationToAdmins = (transactionData: any) => {
  try {
    if (global.io) {
      global.io.to('admin-room').emit('new-transaction', {
        type: 'new-transaction',
        data: {
          ...transactionData,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 New transaction notification sent to admins:`, transactionData);
    }
  } catch (error) {
    console.error('Error sending transaction notification to admins:', error);
  }
};

// Send user funding notification to admins
export const sendUserFundingNotificationToAdmins = (userId: string, amount: number, referenceCode: string) => {
  try {
    if (global.io) {
      global.io.to('admin-room').emit('user-wallet-funded', {
        type: 'user-wallet-funded',
        data: {
          userId,
          amount,
          referenceCode,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 User funding notification sent to admins: User ${userId} funded ${amount}`);
    }
  } catch (error) {
    console.error('Error sending user funding notification to admins:', error);
  }
};

// Send company funding notification to admins
export const sendCompanyFundingNotificationToAdmins = (companyId: string, amount: number, referenceCode: string) => {
  try {
    if (global.io) {
      global.io.to('admin-room').emit('company-wallet-funded', {
        type: 'company-wallet-funded',
        data: {
          companyId,
          amount,
          referenceCode,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 Company funding notification sent to admins: Company ${companyId} funded ${amount}`);
    }
  } catch (error) {
    console.error('Error sending company funding notification to admins:', error);
  }
};

// Send withdrawal notification to admins
export const sendWithdrawalNotificationToAdmins = (entityType: 'user' | 'company', entityId: string, amount: number, referenceCode: string) => {
  try {
    if (global.io) {
      global.io.to('admin-room').emit('wallet-withdrawal', {
        type: 'wallet-withdrawal',
        data: {
          entityType,
          entityId,
          amount,
          referenceCode,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 Withdrawal notification sent to admins: ${entityType} ${entityId} withdrew ${amount}`);
    }
  } catch (error) {
    console.error('Error sending withdrawal notification to admins:', error);
  }
};

// Send refund notification to admins
export const sendRefundNotificationToAdmins = (userId: string, amount: number, referenceCode: string) => {
  try {
    if (global.io) {
      global.io.to('admin-room').emit('transaction-refunded', {
        type: 'transaction-refunded',
        data: {
          userId,
          amount,
          referenceCode,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 Refund notification sent to admins: User ${userId} refunded ${amount}`);
    }
  } catch (error) {
    console.error('Error sending refund notification to admins:', error);
  }
};

// Send fee type transaction notification to admins
export const sendFeeTypeTransactionNotificationToAdmins = (transactionData: {
  feeType: string;
  transactionType: string;
  amount: number;
  description: string;
  referenceCode: string;
  entityType: "user" | "company";
  entityId: string;
  feeBreakdown: {
    mainFee: number;
    serviceFee: number;
    vatAmount: number;
    totalAmount: number;
  };
}) => {
  console.log('🔔 sendFeeTypeTransactionNotificationToAdmins called with:', transactionData);
  
  try {
    if (global.io) {
      console.log('📡 global.io is available, sending notification...');
      global.io.to('admin-room').emit('fee-type-transaction', {
        type: 'fee-type-transaction',
        data: {
          ...transactionData,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 Fee type transaction notification sent to admins: ${transactionData.feeType} - ${transactionData.amount}`);
    } else {
      console.log('❌ global.io is not available');
    }
  } catch (error) {
    console.error('❌ Error sending fee type transaction notification to admins:', error);
  }
};

// Send fee type notification count update to admins
export const sendFeeTypeNotificationCountUpdateToAdmins = (feeTypeCounts: Array<{
  feeType: string;
  count: number;
  totalAmount: number;
}>) => {
  try {
    if (global.io) {
      global.io.to('admin-room').emit('fee-type-notification-counts', {
        type: 'fee-type-notification-counts',
        data: {
          counts: feeTypeCounts,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`📡 Fee type notification counts update sent to admins:`, feeTypeCounts);
    }
  } catch (error) {
    console.error('Error sending fee type notification counts update to admins:', error);
  }
}; 