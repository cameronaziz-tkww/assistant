import * as determineShouldRun from '../../util/determineShouldRun';
import { FileMatch } from '../../types';

const determineShouldRunSpy = jest.spyOn(determineShouldRun, 'default');

const notMatched = {
  isMatchedFile: false,
} as FileMatch;

const matched = {
  isMatchedFile: true,
} as FileMatch;

export default {
  determineShouldRunSpy,
  notMatched,
  matched,
};
