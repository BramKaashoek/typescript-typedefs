import 'reflect-metadata';

export const types: IType[] = [];
export const inputs: IType[] = [];
export const interfaces: IType[] = [];
export const fields: IField[] = [];

export interface IType {
  target: Function;
  fields: any[];
  implements?: Function;
  directives?: IDirective[];
}

export interface IField {
  target: Function;
  propertyKey: string;
  type: string;
  passedType: Function;
  nullable: boolean;
  directives: IDirective[];
}

interface IFieldArgs {
  type?: Function | object;
  nullable?: boolean;
  directives?: IDirective[];
}

interface IDirective {
  directive: string;
  [key: string]: string;
}

interface ITypeArgs {
  implements?: Function;
  directives?: IDirective[];
}

export const Type = (args?: ITypeArgs): ClassDecorator => (target: Function): void => {
  let directives = [];
  let implementsClass = undefined;

  if (types.some((e): boolean => e.target.name === target.name))
    throw new Error(`Error: Duplicate @Type ${target.name}`);

  const extendsClass = Reflect.getMetadata('extendedClass', target);
  if (typeof args !== 'undefined') {
    if (args.implements) implementsClass = args.implements;
    if (args.directives) directives = args.directives;
  }

  types.push({ target, fields: [], implements: implementsClass || extendsClass, directives });
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
  let nullable = false;
  let passedType = undefined;
  let directives = [];

  if (typeof args === 'function' || typeof args === 'undefined') {
    passedType = args;
  } else {
    if (args.nullable) nullable = args.nullable;
    if (args.directives) directives = args.directives;
    passedType = args.type;
  }

  fields.push({
    target: klass.constructor,
    propertyKey: String(propertyKey),
    type: undefined,
    passedType,
    nullable: nullable,
    directives: directives,
  });
};

export const Interface = (): ClassDecorator => (target: Function): void => {
  if (interfaces.some((e): boolean => e.target.name === target.name))
    throw new Error(`Error: Duplicate @Interface ${target.name}`);
  interfaces.push({ target, fields: [] });
  Reflect.defineMetadata('extendedClass', target, target);
};
