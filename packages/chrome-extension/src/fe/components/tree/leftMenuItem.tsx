import Tooltip from '@components/tooltip';
import React, { FunctionComponent } from 'react';
import Checkbox from '../checkbox';
import * as Styled from './styled';

interface LeftMenuItemProps {
  option: App.Menu.SelectOption<string>;
  currentPath: App.UI.IdPath;
  onSelect: App.UI.LeftMenuOnSelect;
}

const LeftMenuItem: FunctionComponent<LeftMenuItemProps> = (props) => {
  const { onSelect, option, currentPath } = props;

  const handleClick = (nextValue: boolean) => {
    onSelect(currentPath, option, nextValue);
  };

  return (
    <Styled.LeftMenuItem>
      <Checkbox
        isDisabled={option.disabled}
        isChecked={option.isSelected}
        label={option.label}
        handleClick={handleClick}
      />
      {option.disabled && option.disabledTooltip &&
        <Tooltip
          text={option.disabledTooltip}
        >
          <Styled.InfoIcon />
        </Tooltip>
      }
    </Styled.LeftMenuItem>
  );
};

export default LeftMenuItem;
