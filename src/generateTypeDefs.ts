import { Int, Float, ID } from './types';
import {
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
  GraphQLScalarType,
} from 'graphql';
import 'reflect-metadata';
import { types, fields, IType, IField, inputs, interfaces } from './decorators';

export const generateTypeDefs = (klasses): string => {
  // interfaces
  const enrichedInterfaces = enrichTypes(klasses, interfaces, fields);
  const interfacesAsString = enrichedInterfaces
    .map((interfaceType): string => generateTypeString(interfaceType, 'interface'))
    .join('\n\n');

  // types
  const enrichedTypes = enrichTypes(klasses, types, fields);
  const typesAsString = enrichedTypes
    .map((type): string => generateTypeString(type, 'type'))
    .join('\n\n');

  // inputs
  const enrichedInputTypes = enrichTypes(klasses, inputs, fields);
  const inputTypesAsString = enrichedInputTypes
    .map((inputType): string => generateTypeString(inputType, 'input'))
    .join('\n\n');

  // return based on presence of types/inputs
  let typeDefs = '';
  if (enrichedInterfaces.length) typeDefs += interfacesAsString + '\n\n';
  if (enrichedTypes.length) typeDefs += typesAsString + '\n\n';
  if (enrichedInputTypes.length) typeDefs += inputTypesAsString + '\n\n';

  typeDefs = typeDefs.slice(0, -2);
  return typeDefs;
};

const generateTypeString = (type, typeName): string => {
  return `${typeName} ${type.target.name} ${
    type.implements ? 'implements ' + type.implements.name + ' ' : ''
  }{\n${type.fields
    .map((field): string => `  ${field.propertyKey}: ${field.type}${field.nullable ? '' : '!'}`)
    .join('\n')}\n}`;
};

const enrichTypes = (klasses, types, fields): IType[] => {
  const names = klasses.map((klass): string => klass.name);
  const selectedTypes = types.filter((e): boolean => names.includes(e.target.name));

  // match fields to types
  const typesWithFields = selectedTypes.map(
    (obj): IType => {
      obj.fields = fields
        .filter((field): boolean => field.target.prototype === obj.target.prototype)
        .map(
          (field): IField => {
            const getType = Reflect.getMetadata(
              'design:type',
              obj.target.prototype,
              field.propertyKey,
            );
            if (!getType)
              throw new Error(
                `no type found for field ${field.propertyKey} on class ${
                  obj.target.name
                }. In case of circular dependency use @Field(forwardRef(() => Type)).`,
              );
            field.type = translateToGraphqlType(
              getType,
              field.passedType,
              field.propertyKey,
              obj.target.name,
            );
            return field;
          },
        );
      return obj;
    },
  );

  // check whether each type/inputType has at least 1 field
  typesWithFields.map(
    (type): void => {
      if (!type.fields.length)
        throw new Error(`Class ${type.target.name} must contain at least 1 @Field`);
    },
  );

  return typesWithFields;
};

const translateToGraphqlType = (getType, passedType, fieldName, className): GraphQLScalarType => {
  // array fields
  if (getType.prototype === Array.prototype) {
    if (!passedType)
      throw new Error(
        `Array ${fieldName} on ${className} has no type. Arrays must always be provided with a type. In case of circular dependency, use @Field(forwardRef(() => Type)).`,
      );

    const type = getGraphqlTypeFromType(passedType);
    return `[${type}!]`;
  }

  // non-array fields
  return getGraphqlTypeFromType(getType, passedType);
};

const getGraphqlTypeFromType = (type, passedType = undefined): GraphQLScalarType => {
  if (type.isForwardRef) {
    return resolveForwardRef(type);
  }

  switch (type.prototype) {
    case String.prototype:
      if (passedType && passedType.prototype === ID.prototype) return GraphQLID;
      return GraphQLString;
    case Boolean.prototype:
      return GraphQLBoolean;
    case Number.prototype:
      if (!passedType) return GraphQLFloat;
      if (passedType.prototype === Int.prototype) return GraphQLInt;
      if (passedType.prototype === Float.prototype) return GraphQLFloat;
      throw new Error('Incorrect field type for number, must be Int or Float');
    case Float.prototype:
      return GraphQLFloat;
    case Int.prototype:
      return GraphQLInt;
    case ID.prototype:
      return GraphQLID;
    default:
      return type.name;
  }
};

export const forwardRef = (forwardRefFn): object => {
  forwardRefFn.fn = forwardRefFn;
  forwardRefFn.isForwardRef = true;
  return forwardRefFn;
};

const resolveForwardRef = (type): any => {
  return type().name;
};
