import React from 'react';
import { useTranslation } from 'react-i18next';

const SellerDashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-40 pb-10">
      <h1 className="text-2xl font-bold text-primary-dark uppercase tracking-tighter">{t('dashboard.seller.title')}</h1>
      <p className="text-text-light mt-2 font-medium">{t('dashboard.seller.subtitle')}</p>
    </div>
  );
};

export default SellerDashboard;
