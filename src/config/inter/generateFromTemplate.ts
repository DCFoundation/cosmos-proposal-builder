function escapeTemplateLiterals(code: string) {
  return code.replace(/\$\{/g, '{{OPEN}}').replace(/\}/g, '{{CLOSE}}');
}

function unescapeTemplateLiterals(code: string) {
  return code.replace(/{{OPEN}}/g, '${').replace(/{{CLOSE}}/g, '}');
}

function escapeBackticksInComments(code: string) {
  // may need improvement for complex cases
  return code.replace(/(\/\/.*?)(`)/g, '$1\\`');
}

function unescapeBackticksInComments(code: string) {
  return code.replace(/(\/\/.*?)\\`/g, '$1`');
}

const prepareArrayForInterpolation = (arr: string[] | number[]) =>
  arr
    .map((item) => `"${item}",\n      `)
    .join('')
    .trimEnd();

/**
 * Parses a template string preserving original template literals.
 * Replaces all instances of:
 * - %%{key}%% with "${value}" (quoted string)
 * - %%N{key}N%% with ${value} (numbers, unquoted string)
 * - %%U{key}U%% with ${value} (intra-string value)
 */
export function generateFromTemplate<T extends Record<string, unknown>>(
  template: string,
  values: T extends Record<string, string | number | string[] | number[]>
    ? T
    : never
) {
  template = escapeTemplateLiterals(template);
  template = escapeBackticksInComments(template);

  Object.keys(values).forEach((key) => {
    const formattedValue = Array.isArray(values[key])
      ? prepareArrayForInterpolation(values[key] as string[] | number[])
      : values[key];

    // replace quoted strings
    const quoted = new RegExp(`"%%${key}%%"`, 'g');
    if (template.match(quoted)) {
      template = template.replace(quoted, `"${formattedValue}"`);
    }

    // replace numbers
    const numbers = new RegExp(`"%%N${key}N%%"`, 'g');
    if (template.match(numbers)) {
      template = template.replace(numbers, formattedValue as string);
    }

    // replace intra-string values with unquoted values
    const unQuoted = new RegExp(`%%U${key}U%%`, 'g');
    if (template.match(unQuoted)) {
      template = template.replace(unQuoted, formattedValue as string);
    }
  });

  template = unescapeTemplateLiterals(template);
  template = unescapeBackticksInComments(template);

  return template;
}
