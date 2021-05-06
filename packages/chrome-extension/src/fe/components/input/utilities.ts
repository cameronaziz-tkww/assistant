export const containerPosition = (position?: App.Position): string => {
  switch (position) {
    case 'center': return 'center';
    case 'left': return 'flex-start';
    case 'right': return 'flex-end';
    default: return 'center';
  }
};
