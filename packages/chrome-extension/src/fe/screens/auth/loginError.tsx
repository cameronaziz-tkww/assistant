import { useErrors } from '@hooks';
import React, { FunctionComponent } from 'react';

interface AppProps {
  messageId: string | null;
  unit: App.LoginUnit;
}

const LoginError: FunctionComponent<AppProps> = (props) => {
  const { messageId, unit } = props;
  const { errorMessage, sendId } = useErrors(unit);

  const hasLastError = sendId === messageId && errorMessage !== null;

  if (!hasLastError) {
    return null;
  }

  return (
    <div>
      {errorMessage}
    </div>
  );
};

export default LoginError;
