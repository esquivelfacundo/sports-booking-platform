'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RegistrationSuccessScreen from '@/components/establishment/RegistrationSuccessScreen';

const RegistrationSuccessPage = () => {
  const router = useRouter();
  const [establishmentName, setEstablishmentName] = useState<string>('tu establecimiento');

  useEffect(() => {
    // Get establishment name from localStorage if available
    try {
      const registrationSuccess = localStorage.getItem('registrationSuccess');
      if (registrationSuccess) {
        const data = JSON.parse(registrationSuccess);
        if (data.establishment?.name) {
          setEstablishmentName(data.establishment.name);
        }
      }
    } catch (error) {
      console.error('Error loading registration data:', error);
    }
  }, []);

  return <RegistrationSuccessScreen establishmentName={establishmentName} />;
};

export default RegistrationSuccessPage;
