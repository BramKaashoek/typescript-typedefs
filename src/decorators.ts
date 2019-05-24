import 'reflect-metadata';

export const objectTypes: IObjectType[] = [];
export const fields: IField[] = [];

export interface IObjectType {
  target: any;
  fields: any[];
}

export interface IField {
  target: Function;
  propertyKey: string;
  type: string;
  passedType: Function | string;
}

export const Type = (): ClassDecorator => (target: Function): void => {
  if (objectTypes.some((e): boolean => e.target.name === target.name))
    throw new Error(`Duplicate @Type ${target.name}`);
  objectTypes.push({ target, fields: [] });
};

export const Field = (passedType?: string | Function): PropertyDecorator => (
  klass,
  propertyKey,
): void => {
  fields.push({
    target: klass.constructor,
    propertyKey: String(propertyKey),
    type: undefined,
    passedType,
  });
};
