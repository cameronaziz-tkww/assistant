import { JSONSchema4 } from 'json-schema';
import rules from '../../rules';
import { allMessages } from '../../util/messages';
import checkRuleConstruction, { advancedCheck } from '../__utils__/checkRuleConstruction';

const ruleTypes = ['problem', 'suggestion', 'layout'];
const fixTypes = ['code', 'whitespace'];

// These tests ensure that the schema of rules are valid.
// Its not perfect, but it helps if the rule isn't tested.

describe('rules', () => {
  it('should have all valid imports', () => {
    for(const rule in rules) {
      const ruleFile = require(`../../rules/${rule}`).default || require(`../../rules/${rule}`);
      const { meta, create } = ruleFile;
      expect(meta)
        .toBeDefined();
      const { type, fixable } = meta;

      if (fixable) {
        expect(fixTypes.includes(fixable))
          .toBeTruthy();
      }

      expect(ruleTypes.includes(type))
        .toBeTruthy();

      expect(create)
        .toBeDefined();
    }
  });

  it('should have all valid messages', () => {
    for(const rule in rules) {
      const ruleFile = require(`../../rules/${rule}`).default || require(`../../rules/${rule}`);
      const { messages } = ruleFile.meta;

      expect(messages)
        .toBeDefined();

      const ruleMessages = allMessages[rule];
      if (!ruleMessages) {
        console.log(rule, allMessages);
      }
      expect(ruleMessages)
        .toBeDefined();

      for(const message in messages) {
        const ruleMessage = ruleMessages[message];
        if (!ruleMessage) {
          console.log(rule, message, ruleMessages);
        }
        expect(ruleMessage)
          .toBeDefined();
      }
    }
  });

  it('should have all valid schemas', () => {
    for(const rule in rules) {
      if (rule !== 'redux-state-file-naming') {
        continue;
      }
      const ruleFile = require(`../../rules/${rule}`).default || require(`../../rules/${rule}`);
      const { schema } = ruleFile.meta;

      expect(schema)
        .toBeDefined();

      if (Array.isArray(schema)) {
        schema.forEach((item: JSONSchema4) => {
          checkRuleConstruction(item, rule);
        });
        continue;
      }

      advancedCheck(schema, rule);
    }
  });
});
