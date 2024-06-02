import { useContext } from 'react';
import { NetworkContext } from '../contexts/network';

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a Network Provider');
  }
  return context;
};
