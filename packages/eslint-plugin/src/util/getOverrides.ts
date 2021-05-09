import { TSESLint } from '@typescript-eslint/experimental-utils';
import { ElementType, stringLiterals } from '../types/constToType';
import { PLUGIN_NAME } from './constants';

const rules = [
  'camelcase',
  'max-classes-per-file',
  'type-delimiter-style',
  'type-declaration-length',
] as const;

const values = stringLiterals(...rules);
type Rule = ElementType<typeof values>;

const getOverrides = <T extends string, U extends readonly unknown[]>(
  context: Readonly<TSESLint.RuleContext<T, U>>,
  rule?: Rule,
): string[] =>
    context
      .getSourceCode()
      .getAllComments()
      .filter((comment) => comment.value.includes(PLUGIN_NAME))
      .filter((comment) => {
        if (typeof rule === 'undefined') {
          return true;
        }
        return comment.value.includes(rule);
      })
      .map((comment) => {
        const { value } = comment;
        const search = typeof rule === 'undefined' ? rules : [rule] as readonly Rule[];
        const finds: string[] = [];
        search.forEach((searchRule) => {
          let startAt = 0;
          while(startAt > -1) {
            const findLocation = value.indexOf(searchRule, startAt);
            if (findLocation < 0) {
              break;
            }
            startAt = findLocation + searchRule.length;
            const endAt = value.indexOf(' ', findLocation);
            const override = value.substring(
              findLocation + searchRule.length + 1,
              endAt > 0 ? endAt : undefined,
            );
            finds.push(override);
          }
        });
        return finds;
      })
      .reduce((acc, cur) => acc.concat(cur), []);

export default getOverrides;

