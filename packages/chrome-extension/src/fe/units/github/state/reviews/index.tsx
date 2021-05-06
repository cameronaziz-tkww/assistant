import Tooltip from '@components/tooltip';
import { github } from '@context';
import React, { Fragment, FunctionComponent } from 'react';
import { BsCircle } from 'react-icons/bs';
import AuthorTooltip from '../../authorTooltip';
import * as Styled from '../styled';
import Approval from './approval';

interface ReviewsProps {
  pullRequest: App.Github.PullRequest;
}

const Reviews: FunctionComponent<ReviewsProps> = (props) => {
  const { isRejected, approvedCount, reviews } = props.pullRequest;
  const { prConfig: { mostReviews }, settings: { reviewsRequired } } = github.useTrackedState();
  const required = reviewsRequired || 2;
  const remaining = required - approvedCount < 0 ? 0 : required - approvedCount;
  const emptyIcons = Array.from({ length: remaining });
  const fakeIcons = Array.from({ length: mostReviews - remaining - approvedCount });
  const approvals = reviews.filter((review) => review.state === 'APPROVED');
  const fails = props.pullRequest.reviews.filter((review) => review.state === 'CHANGES_REQUESTED').map((review) => review.author);

  return (
    <Tooltip
      text={
        <Fragment>
          Changes requested by
          {fails.map((author) =>
          <AuthorTooltip key={author.login} author={author} />,
        )}
        </Fragment>
      }
      isDisabled={!isRejected}>
      <Styled.StateContainer isRed={isRejected}>
        <Styled.StateLabel>
          Reviews:
      </Styled.StateLabel>
        {approvals.map((approval) =>
          <Approval key={approval.author.login} approval={approval} />
        ,
        )}
        {emptyIcons.map((_, index) =>
          <Styled.IconContainer key={index} appColor="yellow">
            <BsCircle />
          </Styled.IconContainer>,
        )}
        {fakeIcons.map((_, index) =>
          <Styled.IconContainer key={index} isFake appColor="white">
            <BsCircle />
          </Styled.IconContainer>,
        )}
      </Styled.StateContainer>

    </Tooltip>
  );
};

export default Reviews;
