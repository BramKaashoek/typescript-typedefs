import 'reflect-metadata';

export const types: IType[] = [];
export const inputTypes: IType[] = [];
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
  nullable: boolean;
}

interface IFieldArgs {
  type?: Function;
  nullable?: boolean;
}

export const Type = (): ClassDecorator => (target: Function): void => {
  if (types.some((e): boolean => e.target.name === target.name))
    throw new Error(`Duplicate @Type ${target.name}`);
  types.push({ target, fields: [] });
};

export const InputType = (): ClassDecorator => (target: Function): void => {
  if (inputTypes.some((e): boolean => e.target.name === target.name))
    throw new Error(`Duplicate @InputType ${target.name}`);
  inputTypes.push({ target, fields: [] });
};

export const Field = (args?: Function | IFieldArgs): PropertyDecorator => (
  klass,
  propertyKey,
): void => {
  let nullable = false;
  let passedType = undefined;

  if (typeof args === 'function' || typeof args === 'undefined') {
    passedType = args;
  } else {
    if (args.nullable) nullable = args.nullable;
    passedType = args.type;
  }

  fields.push({
    target: klass.constructor,
    propertyKey: String(propertyKey),
    type: undefined,
    passedType,
    nullable: nullable,
  });
};
