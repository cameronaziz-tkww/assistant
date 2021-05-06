import { links } from '@hooks';
import { isConfigKey, isCustomConfig, isStandardConfig } from '@utils/guards';
import React, { forwardRef, PropsWithChildren } from 'react';
import * as Styled from '../../styled';
import ButtonLabel from './buttonLabel';
import Hotkey from './hotkey';
import Label from './label';
import Path from './path';
import URL from './url';

interface OptionsProps {
  link: App.Links.Link;
  type: App.Links.LinkType;
}

const Options = forwardRef<HTMLDivElement, PropsWithChildren<OptionsProps>>((props, ref) => {
  const { link, type } = props;
  const updateLink = links.useUpdateLink();

  const update = <T extends keyof App.Links.Link>(key: T, value: App.Links.Link[T]) => {
    updateLink({
      id: link.id,
      key,
      value,
    });
  };

  const updateStandard = <T extends keyof App.Links.StandardConfig>(key: T, value: App.Links.StandardConfig[T]) => {
    if (isConfigKey(key)) {
      update(key, value as App.ShouldDefineType);
    }
  };

  const updateCustom = <T extends keyof App.Links.CustomConfig>(key: T, value: App.Links.CustomConfig[T]) => {
    if (isConfigKey(key)) {
      update(key, value);
    }
  };

  return (
    <Styled.Options ref={ref}>
      {isStandardConfig(type, link) &&
        <ButtonLabel link={link} update={updateStandard} />
      }
      <Label link={link} type={type} update={updateCustom} />
      {isCustomConfig(type, link) &&
        <URL link={link} update={updateCustom} />
      }
      {isStandardConfig(type, link) && link?.pathsNeeded && link.pathsNeeded.map((path, index) => (
        <Path key={path.name} link={link} index={index} path={path} update={updateStandard} />
      ))}
      <Hotkey link={link} update={updateCustom} />
    </Styled.Options>
  );
});

export default Options;
