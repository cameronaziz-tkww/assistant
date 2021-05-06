// import { Reactor } from '@utils';
// import React, { FunctionComponent, useRef, useState } from 'react';
// import SettingsModal from '../ui';
// import createStateContext, { ContextValue } from './create';

// interface SettingsModalProps {
//   pages: App.Modal.Selections;
// }

// const createReactor = (selections: App.Modal.Selections) => {
//   const reactor = new Reactor();
//   for (const selection in selections) {
//     const current = selections[selection];
//     if (current.footerActions) {
//       current.footerActions.forEach((action) => {
//       });
//     }
//   }

//   return reactor;
// };

// const SettingsModalContextProvider: FunctionComponent<SettingsModalProps> = (props) => {
//   type Key = keyof SettingsModalProps['pages'];
//   const rectorRef = useRef<Reactor<Key, App.ShouldDefineType>>(createReactor(props.pages));
//   const { children, pages } = props;
//   const SettingsModalContext = createStateContext<Key>();
//   const [selectionId, setSelectionId] = useState<Key | null>(null);

//   const updateSelection = (selection: Key | null) => {
//     if (selection === null) {
//       setSelectionId(null);
//       return;
//     }
//     setSelectionId(selection);
//   };

//   const selection = selectionId === null ? null : pages[selectionId];

//   const value: ContextValue<Key> = {
//     selection,
//     selectionId,
//     updateSelection,
//     reactor: rectorRef.current,
//   };

//   return (
//     <SettingsModalContext.Provider value={value}>
//       {children}
//       <SettingsModal />
//     </SettingsModalContext.Provider>
//   );
// };

// export default SettingsModalContextProvider;
