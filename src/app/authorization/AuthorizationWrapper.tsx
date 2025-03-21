import React, { useState, useEffect } from 'react';
import { AuthorizationService } from '../../api/authorization';
import { FaCircleNotch, FaTimesCircle } from 'react-icons/fa';
import './AuthorizationWrapper.css';

type AuthorizationWrapperProps = {
  children: React.ReactNode;
  authorizationService: AuthorizationService;
};

export const AuthorizationWrapper: React.FC<AuthorizationWrapperProps> = ({ children, authorizationService }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      const authorized = await authorizationService.isAuthorized();
      setIsAuthorized(authorized);
    };
    checkAuthorization();
  }, [authorizationService]);

  if (isAuthorized === null) {
    return (
      <div className="full-page-container">
        <FaCircleNotch className="loading-icon" />
      </div>
    ); // Loader while checking authorization
  }

  if (!isAuthorized) {
    return (
      <div className="full-page-container">
        <FaTimesCircle className="error-icon" />
        <p className="error-text" dir='rtl'>נראה שאין לך הרשאות :/</p> {/* Error message in Hebrew */}
      </div>
    );
  }

  return <>{children}</>;
};
