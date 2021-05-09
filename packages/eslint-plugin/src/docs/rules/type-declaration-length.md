# Enforce type declarations with long lengths to wrap lines and apply consistent formatting(type-declaration-length)

## Rule Details

This rule enforces consistent type declaration lengths.

## Options

This rule has an object option:

Configuration
* `"maxLength": integer` (default `100`) enforces the maximum length of the line, `0` will disables this option
* `"alwaysBreak": false` (default) does not enforce line breaks on each member.
* `"alwaysBreak": true` enforce breaks to new lines for each member, when `true`, defaults to `3` or more members
* `"alwaysBreak": integer` enforce breaks to new lines for types with greater than or equal to given number of members
* `"breakOneBreakAll": boolean` (default `true`) enforces multi line type declaration to have each member on own line
* `"consistentBreaks": boolean` (default `true`) enforces multi line type declaration to have no extra line breaks
* `"types": Array<"intersection" | "tuple" | "union">` (default `["intersection", "tuple", "union"]`- enforce rule only to included types
* `"intersection": NestedObject` - enforce specific rules for intersection type - see below for options
* `"tuple": NestedObject` - enforce specific rules for tuple type - see below for options
* `"union": NestedObject` - enforce specific rules for union type - see below for options

NestedObject Options
* `"enabled": boolean` (default `true`) enforces this rule for this type
* `"maxLength": integer` (default `100`) same behavior as main object
* `"alwaysBreak": boolean | number` (default `false`) same behavior as main object
* `"breakOneBreakAll": boolean` (default `true`) same behavior as main object
* `"consistentBreaks": boolean` (default `true`) same behavior as main object

Default Configuration
```json
{
  "alwaysBreak": false,
  "breakOneBreakAll": true,
  "consistentBreaks": true,
  "maxLength": 100,
  "types": [
    "intersection",
    "tuple",
    "union"
  ]
}
```
> Note: All examples show use of a `union`, but same rules can be applied to a `tuple` or an `intersection`.

### maxLength
c
Examples of **incorrect** code for this rule with the default `{ "maxLength": 100 }` option:

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "maxLength": 100 }]*/

type Foo = 'bar' | 'baz' | number | boolean | MyType | MyOtherTypeWithALongName | 'harder' | 'to' | 'read';
```

Examples of **correct** code for this rule with the default `{ "maxLength": 100 }` option:

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "maxLength": 100 }]*/

type Foo =
  | 'bar'
  | 'baz'
  | number
  | boolean
  | MyType
  | MyOtherTypeWithALongName
  | 'easier'
  | 'to'
  | 'read';

```

### breakOneBreakAll

Examples of **incorrect** code for this rule with the default `{ "breakOneBreakAll": true }` option:

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "breakOneBreakAll": true }]*/

type Foo = 'bar'
  | 'baz'
  | number;
```

Examples of **correct** code for this rule with the default `{ "breakOneBreakAll": true }` option:

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "breakOneBreakAll": true }]*/

type Foo =
  | 'bar'
  | 'baz'
  | number;

```

### alwaysBreak

Examples of **incorrect** code for this rule option:

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "alwaysBreak": true }]*/

type Foo = 'bar' | 'baz' | number;
```

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "alwaysBreak": 4 }]*/

type Foo = 'bar' | 'baz' | number | boolean;

```

Examples of **correct** code for this rule option:

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "alwaysBreak": true }]*/

type Foo =
  | 'bar'
  | 'baz'
  | number;

```

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "alwaysBreak": 4 }]*/

type Foo = 'bar' | 'baz' | number;

```


### consistentBreaks

Examples of **incorrect** code for this rule option:

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "consistentBreaks": true }]*/

type Foo =
  | 'bar'

  | 'baz'
  | number;
```


Examples of **correct** code for this rule option:

```typescript
/*eslint tkww-assistant/type-declaration-length: ["error", { "consistentBreaks": true }]*/

type Foo =
  | 'bar'
  | 'baz'
  | number;

```


## Fix

The `--fix` option on the command line can automatically fix some of the problems reported by this rule.

## When Not To Use It

If you don't want to be notified about long type declarations.