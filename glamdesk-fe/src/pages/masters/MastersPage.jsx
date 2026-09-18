import ServiceMaster from './ServiceMaster';
import VenueMaster from './VenueMaster';
import VendorMaster from './VendorMaster';

const MastersPage = ({ subTab = 'services' }) => {
  if (subTab === 'services') {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <ServiceMaster />
      </div>
    );
  }

  if (subTab === 'venue') {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <VenueMaster />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <VendorMaster />
    </div>
  );
};

export default MastersPage;

