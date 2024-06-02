import { toast } from 'react-toastify';
import { ClipboardDocumentIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/20/solid';

export const BundleFollowerToastMessage = ({
  endoZipBase64Sha512,
  closeToast = () => {},
  clipboard,
}: {
  endoZipBase64Sha512: string;
  closeToast: () => void;
  clipboard?: Navigator['clipboard'];
}) => (
  <div className='flex items-start pointer-events-auto'>
    <div className='ml-3 w-0 flex-1 pt-0.5'>
      <p className='text-sm font-medium text-gray-900'>
        Bundle Successfully Installed!
      </p>
      {clipboard && (
        <span className='mt-1 text-sm text-gray-500'>
          <span
            className='text-sm text-blue-500 hover:text-blue-700 underline cursor-pointer'
            onClick={async () => {
              await clipboard.writeText(endoZipBase64Sha512);
              toast.info('Copied to clipboard!', {
                position: 'bottom-center',
                autoClose: 3000,
                hideProgressBar: true,
              });
            }}
          >
            EndoZipBase64Sha512{' '}
            <ClipboardDocumentIcon className='inline-block w-4 h-4' />
          </span>
        </span>
      )}
    </div>
    <div className='ml-4 flex flex-shrink-0'>
      <button
        type='button'
        className='inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
        onClick={closeToast}
      >
        <span className='sr-only'>Close</span>
        <XMarkIcon className='h-5 w-5' aria-hidden='true' />
      </button>
    </div>
  </div>
);
