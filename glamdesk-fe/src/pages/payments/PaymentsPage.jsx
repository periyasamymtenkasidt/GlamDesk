const PaymentsPage = ({ subTab = 'client' }) => {
  const titles = {
    client: 'Client Payments',
    vendor: 'Vendor Payments',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold font-outfit text-glam-text tracking-tight">
        {titles[subTab] || 'Payments'}
      </h1>
    </div>
  );
};

export default PaymentsPage;
