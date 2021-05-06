import Input from '@components/input';
import { github } from '@hooks';
import React, { ChangeEvent, FunctionComponent } from 'react';

const ReviewsRequired: FunctionComponent = () => {
  const { settings: { reviewsRequired } } = github.useSettings(['reviewsRequired']);
  const updateSettings = github.useUpdateSettings();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length === 0) {
      updateSettings('reviewsRequired', undefined);
      return;
    }

    const num = Number(event.target.value);
    if (isNaN(num)) {
      return;
    }
    updateSettings('reviewsRequired', num);
  };

  return (
    <Input
      containerPosition="left"
      maxSize={2}
      label="Reviews Required"
      value={reviewsRequired}
      onChange={onChange}
    />
  );
};

export default ReviewsRequired;
