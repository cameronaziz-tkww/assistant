import React, { FunctionComponent } from 'react';
import Global from './global';
import Modal from './modal';

const Providers: FunctionComponent = ({ children }) => {
  return (
    <Modal.Provider>
      <Global.Provider>
        {children}
      </Global.Provider>
    </Modal.Provider>
  );
};

export default Providers;
