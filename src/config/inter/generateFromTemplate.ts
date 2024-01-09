function escapeTemplateLiterals(code: string) {
  return code.replace(/\$\{/g, "{{OPEN}}").replace(/\}/g, "{{CLOSE}}");
}

function unescapeTemplateLiterals(code: string) {
  return code.replace(/{{OPEN}}/g, "${").replace(/{{CLOSE}}/g, "}");
}

function escapeBackticksInComments(code: string) {
  // may need improvement for complex cases
  return code.replace(/(\/\/.*?)(`)/g, "$1\\`");
}

function unescapeBackticksInComments(code: string) {
  return code.replace(/(\/\/.*?)\\`/g, "$1`");
}

export function generateFromTemplate<T extends Record<string, unknown>>(
  template: string,
  values: T,
) {
  template = escapeTemplateLiterals(template);
  template = escapeBackticksInComments(template);

  Object.keys(values).forEach((key) => {
    // replace quoted strings
    const quoted = new RegExp(`"%%${key}%%"`, "g");
    if (template.match(quoted)) {
      template = template.replace(quoted, `"${values[key]}"`);
    }

    // replace numbers
    const numbers = new RegExp(`"%%N${key}N%%"`, "g");
    if (template.match(numbers)) {
      template = template.replace(numbers, values[key] as string);
    }

    // replace intra-string values with unquoted values
    const unQuoted = new RegExp(`%%U${key}U%%`, "g");
    if (template.match(unQuoted)) {
      template = template.replace(unQuoted, values[key] as string);
    }
  });

  template = unescapeTemplateLiterals(template);
  template = unescapeBackticksInComments(template);

  return template;
}
