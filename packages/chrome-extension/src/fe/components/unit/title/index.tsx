import React, { FunctionComponent, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import Menu from './menu';
import Rotator from './rotator';
import * as Styled from './styled';

interface TitleProps {
  text: string;
  align?: 'left' | 'right';
  rotated?: boolean;
  sideNode?: ReactNode;
  subText?: ReactNode;
  icon?: IconType;
  isDark?: boolean;
  menuConfigurations?: App.Menu.Configurations;
}

const Title: FunctionComponent<TitleProps> = (props) => {
  const { text, sideNode, rotated, subText, isDark, menuConfigurations, align } = props;
  const { left, right } = menuConfigurations || {} as App.Menu.Configurations;

  return (
    <Rotator rotated={rotated}>
      <Styled.Container>
        {align === 'left' &&
          <Styled.SideNode align={align}>
            {sideNode}
          </Styled.SideNode>
        }
        <Styled.CenterContainer hasLeft={!!left} hasRight={!!right}>
          <Styled.Text>
            {props.icon &&
              <Styled.Icon>
                <props.icon />
              </Styled.Icon>
            }
            <Styled.TitleText isDark={isDark}>
              {text}
            </Styled.TitleText>
          </Styled.Text>
        </Styled.CenterContainer>
        {right &&
          <Menu menuItems={right} menuLocation="right" />
        }
      </Styled.Container>
      {subText && <Styled.SubTitle>{subText}</Styled.SubTitle>}
    </Rotator>
  );
};

export default Title;
