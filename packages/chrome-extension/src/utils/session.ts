import uuid from './uuid';

const TAB_ID = 'tabId';

export const tabId = (): string => {
  const id = sessionStorage.getItem(TAB_ID);
  if (id) {
    return id;
  }
  const nextId = uuid();
  sessionStorage.setItem(TAB_ID, nextId);
  return nextId;
};