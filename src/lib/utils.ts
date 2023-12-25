import { Expression, Property, SpreadElement, parse } from 'acorn';
import { simple } from 'acorn-walk';

const languageCodes: Record<string, string> = {
  '/public/svg/german.svg': 'de',
  '/public/svg/english-german.svg': 'en+de',
  '/public/svg/english.svg': 'en',
};

export function toLanguageShort(language: string) {
  return languageCodes[language] || language;
}

function propertyToObject(node: Expression): any {
  switch (node.type) {
    case 'ObjectExpression': {
      const obj: Record<any, any> = {};
      node.properties.forEach((property) => {
        obj[propertyToObject((property as Property).key) as any] =
          propertyToObject((property as Property).value);
      });
      return obj;
    }
    case 'Identifier':
      return node.name;
    case 'Literal':
      return node.value;
    case 'ArrayExpression':
      return node.elements.map((e: Expression | SpreadElement | null) =>
        propertyToObject(e as Expression),
      );
  }
}

export function getDefinedVariable<T>(
  code: string,
  variable: string,
): T | undefined {
  let ret: T | undefined = undefined;
  simple(parse(code, { ecmaVersion: 'latest' }), {
    VariableDeclaration(node) {
      node.declarations.forEach((declaration) => {
        if ((declaration.id as any).name === variable) {
          ret = propertyToObject(declaration.init!) as T;
        }
      });
    },
  });
  return ret;
}

export function getDefinedProperty<T>(
  code: string,
  property: string,
): T | undefined {
  let ret: T | undefined = undefined;
  simple(parse(code, { ecmaVersion: 'latest' }), {
    Property(node) {
      if ((node.key as any).name === property) {
        ret = propertyToObject(node.value as any) as T;
      }
    },
  });
  return ret;
}
