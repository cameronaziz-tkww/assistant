// import React, { FunctionComponent } from 'react';
// import { Button } from '@components/button';
// import useModalContext from './use';

// interface FooterActionProps {
//   action: App.Modal.FooterAction
// }

// const FooterAction: FunctionComponent<FooterActionProps> = (props) => {
//   const { action: { label, id } } = props;
//   const { reactor, selectionId } = useModalContext();

//   const handleClick = () => {
//     if (selectionId) {
//       reactor.dispatchEvent(id, selectionId);
//     }
//   };

//   return (
//     <Button onClick={handleClick}>
//       {label}
//     </Button>
//   );
// };

// export default FooterAction;
