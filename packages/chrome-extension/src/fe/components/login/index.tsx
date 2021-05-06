import Button from '@components/button';
import Unit from '@components/unit';
import { modal } from '@hooks';
import React, { FunctionComponent } from 'react';

interface LoginProps {
  unit: App.LoginUnit;
  column: App.UnitColumn;
}

const Login: FunctionComponent<LoginProps> = (props) => {
  const { unit, column } = props;
  const update = modal.useUpdate();

  const handleClick = () => {
    update.selection(unit);
  };

  return (
    <Unit.Container rightMargin column={column}>
      <Button
        onClick={handleClick}
        size="lg"
      >
        Login
      </Button>
    </Unit.Container>
  );
};

export default Login;
