import { Type, validator } from '@openmrs/esm-framework';

export const configSchema = {
  casualGreeting: {
    _type: Type.Boolean,
    _default: false,
    _description:
      "Whether to use a casual greeting (or a formal one)."
  },
  whoToGreet: {
    _type: Type.Array,
    _default: ["World"],
    _description: "Who should be greeted. Names will be separated by a comma and space.",
    _elements: {
      _type: Type.String
    },
    _validators: [validator(v => v.length > 0, "At least one person must be greeted.")]
  }
};
