import Button from '@components/button';
import Input from '@components/input';
import Select from '@components/select';
import { honeybadger } from '@hooks';
import React, { Fragment, FunctionComponent, useState } from 'react';

const options: App.Menu.SelectOption<App.TimeAgo>[] = [
  {
    value: 'hour',
    label: 'Hour',
  },
  {
    value: 'day',
    label: 'Day',
  },
  {
    value: 'week',
    label: 'Month',
  },
  {
    value: 'month',
    label: 'Month',
  },
];
const CreateMonitor: FunctionComponent = () => {
  const [noticeLimit, setNoticeLimit] = useState<number>();
  const [timeAgo, setTimeAgo] = useState<App.TimeAgo>();
  const { updateMonitor } = honeybadger.useMonitors();

  const handleCreate = () => {
    if (noticeLimit && timeAgo) {
      updateMonitor(
        {
          noticeLimit,
          timeAgo,
        },
        true,
      );
    }
  };

  const handleNoticeChange = (nextNoticeLimit: string) => {
    const limit = Number(nextNoticeLimit);
    if (limit) {
      setNoticeLimit(limit);
    }
  };

  const handleTimeAgoChange = (nextTimeAgo: App.Menu.SelectOption<App.TimeAgo>) => {
    setTimeAgo(nextTimeAgo.value);
  };

  return (
    <Fragment>
      <Button
        absolute={{
          top: 4,
          right: 4,
        }}
        onClick={handleCreate}
        size="sm"
      >
        Create
      </Button>
      <Input
        inline
        onReactChange={handleNoticeChange}
        inlineLabel
        label="Notice Limit"
        onlyNumbers
        maxSize={3}
      />
      <Select
        inlineLabel
        onSelect={handleTimeAgoChange}
        label="Time Ago to Trigger"
        options={options}
      />

    </Fragment>

  );
};

export default CreateMonitor;
