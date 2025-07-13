/* eslint-disable @typescript-eslint/no-explicit-any */
 export const getErrorMessage = (error: any, defaultMessage: string): string => {
    if (error?.data?.message) {
      if (Array.isArray(error.data.message)) {
        const firstError = error.data.message[0];
        if (typeof firstError === 'string') {
          return firstError;
        } else if (firstError?.error) {
          return firstError.error;
        } else if (firstError?.field) {
          return `Error in ${firstError.field}: ${firstError.error || 'Invalid value'}`;
        }
      } else if (typeof error.data.message === 'string') {
        return error.data.message;
      }
    } else if (error?.message && typeof error.message === 'string') {
      return error.message;
    }
    return defaultMessage;
  };