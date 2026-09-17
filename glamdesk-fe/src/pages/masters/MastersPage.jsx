import ServiceMaster from './ServiceMaster';

const MastersPage = ({ subTab = 'services' }) => {
  if (subTab === 'services') {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <ServiceMaster />
      </div>
    );
  }

  const titles = {
    venue: 'Venue Pricing Master',
    vendors: 'Vendor Master',
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold font-outfit text-glam-text tracking-tight">
        {titles[subTab] || 'Master'}
      </h1>
    </div>
  );
};

export default MastersPage;

