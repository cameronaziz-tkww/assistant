import { useState } from 'react';

const useForceUpdate: Hooks.UseForceUpdate = () => {
  const [updateCount, setUpdateCount] = useState(0);

  const update = () => {
    setUpdateCount((prevCount) => prevCount + 1);
  };

  return {
    updateCount,
    update,
  };
};

export default useForceUpdate;
