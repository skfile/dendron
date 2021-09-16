import type { Node, Parent } from "unist";

enum DendronQLNodeType {
  FNAME = "fname",
  VAULT_NAME = "vault_name",
  VARIABLE = "variable",
  CONSTANT = "constant",
  FUNCTION = "function",
}

type DendronNode = Node & {
  type: DendronQLNodeType;
};

type DendronQLParser<T extends DendronNode> = (text: string) => T | undefined;

type DendronQLFname = DendronNode & {
  type: DendronQLNodeType.FNAME;
  value: string;
};

/** Parses a note name. */
const parseFname: DendronQLParser<DendronQLFname> = (text) => {
  // Any text without whitespace or square brackets
  const match = text.match(/^([^[\]\s]+)$/);
  if (match) {
    return {
      type: DendronQLNodeType.FNAME,
      value: match[1],
    };
  }
  return;
};

type DendronQLVaultName = DendronNode & {
  type: DendronQLNodeType.VAULT_NAME;
  value: string;
};

/** Parses a vault name. */
const parseVaultName: DendronQLParser<DendronQLVaultName> = (text) => {
  // Any text without whitespace or square brackets
  const match = text.match(/^([^[\]\s]+)$/);
  if (match) {
    return {
      type: DendronQLNodeType.VAULT_NAME,
      value: match[1],
    };
  }
  return;
};

type DendronQLValue = DendronNode &
  (
    | {
        type: DendronQLNodeType.VARIABLE;
        value: string;
      }
    | {
        type: DendronQLNodeType.CONSTANT;
        value: string | number;
      }
  );

/** Parses a value, which may be a constant or a variable. */
const parseValue: DendronQLParser<DendronQLValue> = (text) => {
  // Any string which is text without whitespace or square brackets surrounded by quotes,
  // or any number which is 123 or 123.45 or .45
  const match = text.match(
    /^(["'](?<str>[^[\]\s]+)["']|(?<var>[^[\].\d\s][^[\]\s]*)|(?<num>\d+([.]\d*)?|[.]\d+))$/
  );
  if (match && match.groups) {
    if (match.groups.str) {
      return { type: DendronQLNodeType.CONSTANT, value: match.groups.str };
    }
    if (match.groups.num) {
      return {
        type: DendronQLNodeType.CONSTANT,
        value: Number(match.groups.num),
      };
    }
    if (match.groups.var) {
      return { type: DendronQLNodeType.VARIABLE, value: match.groups.var };
    }
  }
  return;
};

type DendronQLFunction = DendronNode & {
  name: string;
};

const DendronQLBuiltins = {
  OR: "or",
  AND: "and",
  LINK: "link",
  TO: "to",
  FROM: "from",
  CONNECTED: "connected",
  CHILDREN: "children",
  PARENT: "parent",
  DESCENDANTS: "descendants",
  ANCESTORS: "ancestors",
  VAULT: "vault",
};

type DendronQLMultiExpression = DendronNode & {};

type DendronQLExpression = DendronNode & {};
