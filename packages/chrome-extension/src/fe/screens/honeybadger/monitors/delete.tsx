import Button from '@components/button';
import { honeybadger } from '@hooks';
import React, { FunctionComponent } from 'react';

interface DeleteProps {
  monitor: App.Honeybadger.Monitor
}

const Delete: FunctionComponent<DeleteProps> = (props) => {
  const { monitor } = props;
  const { updateMonitor } = honeybadger.useMonitors();

  const handleDelete = () => {
    updateMonitor(monitor, false);
  };

  return (
    <div>
      Any faults that trigger more than or equal to {monitor.noticeLimit} notices in the last {monitor.timeAgo}.
      <Button
        onClick={handleDelete}
        size="sm"
      >
        Delete
      </Button>
    </div>
  );
};

export default Delete;
