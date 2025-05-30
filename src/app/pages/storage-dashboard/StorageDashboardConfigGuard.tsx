import React, { useEffect } from 'react';
import { ConfigApi, ClustersConfig } from '../../../api/config/configApi';
import { FaCircleNotch, FaTimesCircle } from 'react-icons/fa';
import '../../authorization/AuthorizationWrapper.css';

type Props = {
  configApi: ConfigApi;
  children: (config: ClustersConfig) => React.ReactNode;
};

export const StorageDashboardConfigGuard: React.FC<Props> = ({ configApi, children }) => {
  const [config, setConfig] = React.useState<ClustersConfig | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setError(null);
    configApi.getClustersConfig()
      .then(cfg => {
        if (mounted) setConfig(cfg);
      })
      .catch(err => {
        if (mounted) setError(err);
      });
    return () => { mounted = false; };
  }, [configApi]);

  if (error) {
    return (
      <div className="full-page-container">
        <FaTimesCircle className="error-icon" />
        <p className="error-text" dir='rtl'>שגיאה בטעינת קונפיגורציה</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="full-page-container">
        <FaCircleNotch className="loading-icon" />
      </div>
    );
  }

  return <>{children(config)}</>;
};
