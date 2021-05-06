import { FunctionComponent } from 'react';
import type { IconType } from 'react-icons';
import { BsQuestionCircleFill, BsExclamationCircleFill, BsCircleFill, BsCircle } from 'react-icons/bs';
import { numberWords } from '../../../../utils';
import { HalfCircle } from './styled';
import Hourglass from './hourglass';

interface Icon {
  icon: IconType | FunctionComponent;
  color: App.Theme.BaseColor;
}

interface IconWithTooltip extends Icon {
  text: string;
}

export const buildIcon = (status?: App.Github.StatusContext): Icon => {

  if (!status) {
    return {
      icon: BsCircleFill,
      color: 'green',
    };
  }

  switch(status.state) {
    case 'SUCCESS': return {
      icon: BsCircleFill,
      color: 'green',
    };
    case 'ERROR':
    case 'FAILURE': return {
        icon: BsExclamationCircleFill,
      color: 'red',
    };
    case 'PENDING': return {
      icon: Hourglass,
      color: 'yellow',
    };
    default: return {
      icon: BsQuestionCircleFill,
      color: 'white',
    };
  }
};

export const approvedIcon = (approved: App.Github.Approved, reviewsRequired: number): IconWithTooltip => {
  switch (approved) {
    case 'reject': return {
      icon: BsExclamationCircleFill,
      color: 'red',
      text: 'Rejected',
    };
    case 0: return {
      icon: BsCircle,
      color: 'yellow',
      text: 'No Reviews',
    };
  }
  if (approved >= reviewsRequired) {
    return {
      icon: BsCircleFill,
      color: 'green',
      text: `${numberWords(approved, { capitalize: true })} Reviews`,
    };
  }
  return {
    icon: HalfCircle,
    color: 'yellow',
    text: `${numberWords(approved, { capitalize: true })} Review${approved > 1 ? 's' : ''}`,
  };
};
