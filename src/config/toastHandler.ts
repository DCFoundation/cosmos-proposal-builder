import { toast } from 'react-toastify';

export const handleLoadingToast = (
  isLoading: boolean,
  message: string,
  toastId: string
) => {
  if (isLoading) {
    if (!toast.isActive(toastId)) {
      toast.loading(message, { toastId });
    }
  } else {
    if (toast.isActive(toastId)) {
      toast.dismiss(toastId);
    }
  }
};
