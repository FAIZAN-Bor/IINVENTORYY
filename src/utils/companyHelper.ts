// Helper functions for company management

export const getCompanyDisplayName = (companyCode: string): string => {
  switch (companyCode) {
    case 'QASIM SEWING MACHINE':
      return 'Qasim Sewing Machine';
    case 'Q.S TRADERS':
      return 'Q.S Traders';
    case 'EXPERT SEWING MACHINE':
      return 'Expert Sewing Machine';
    default:
      return 'Qasim Sewing Machine';
  }
};

export const getCompanyLogo = (companyCode: string): string => {
  switch (companyCode) {
    case 'QASIM SEWING MACHINE':
      return 'QS';
    case 'Q.S TRADERS':
      return 'QST';
    case 'EXPERT SEWING MACHINE':
      return 'ES';
    default:
      return 'QS';
  }
};

export const getCompanyEmail = (companyCode: string): string => {
  switch (companyCode) {
    case 'QASIM SEWING MACHINE':
      return 'info@qasimsewing.com';
    case 'Q.S TRADERS':
      return 'info@qstraders.com';
    case 'EXPERT SEWING MACHINE':
      return 'info@expertsewing.com';
    default:
      return 'info@qasimsewing.com';
  }
};
