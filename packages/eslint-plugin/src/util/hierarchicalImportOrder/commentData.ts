import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as typeguards from '../../typeguards';

type Placement = 'before' | 'after';


const writeComment = (comment: TSESTree.Comment) => {
  if (typeguards.isBlockComment(comment)) {
    return `/*${comment.value}*/`;
  }
  return `//${comment.value}`;
};

const commentData = (
  comment: TSESTree.Comment,
  placement: Placement,
  basePosition: number,
) => {
  const length = placement === 'after'
    ? comment.range[0] - basePosition
    : basePosition - comment.range[1];

  const padding = Array
    .from({ length })
    .map(() => ' ')
    .join('');

  const commentText = writeComment(comment);

  const extraCharacters = commentText.length
                + comment.range[0] - comment.range[1];

  return {
    commentText,
    extraCharacters,
    padding,
  };
};

export default commentData;
