import ServiceMaster from './ServiceMaster';
import VenueMaster from './VenueMaster';
import VendorMaster from './VendorMaster';

const MastersPage = ({ subTab = 'services' }) => {
  return (
    <div className="p-4 sm:p-6 w-full max-w-[1600px] mx-auto flex-1 flex flex-col min-h-0">
      {subTab === 'services' && <ServiceMaster />}
      {subTab === 'venue' && <VenueMaster />}
      {subTab === 'vendors' && <VendorMaster />}
    </div>
  );
};

export default MastersPage;
