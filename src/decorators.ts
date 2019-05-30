import 'reflect-metadata';

export const types: IType[] = [];
export const inputs: IType[] = [];
export const fields: IField[] = [];

export interface IType {
  target: any;
  fields: any[];
}

export interface IField {
  target: Function;
  propertyKey: string;
  type: string;
  passedType: Function;
  notNullable: boolean;
}

interface IFieldArgs {
  type?: Function;
  notNullable?: boolean;
}

export const Type = (): ClassDecorator => (target: Function): void => {
  if (types.some((e): boolean => e.target.name === target.name))
    throw new Error(`Error: Duplicate @Type ${target.name}`);
  types.push({ target, fields: [] });
};

export const Input = (): ClassDecorator => (target: Function): void => {
  if (inputs.some((e): boolean => e.target.name === target.name))
    throw new Error(`Error: Duplicate @Input ${target.name}`);
  inputs.push({ target, fields: [] });
};

export const Field = (args?: Function | IFieldArgs): PropertyDecorator => (
  klass,
  propertyKey,
): void => {
  let notNullable = false;
  let passedType = undefined;

  if (typeof args === 'function' || typeof args === 'undefined') {
    passedType = args;
  } else {
    if (args.notNullable) notNullable = args.notNullable;
    passedType = args.type;
  }

  fields.push({
    target: klass.constructor,
    propertyKey: String(propertyKey),
    type: undefined,
    passedType,
    notNullable: notNullable,
  });
};
