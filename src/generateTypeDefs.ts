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
import { types, fields, IType, IField, inputs } from './decorators';

export const generateTypeDefs = (klasses): string => {
  // types
  const enrichedTypes = enrichTypes(klasses, types, fields);
  const typesAsString = enrichedTypes.map((type): string => generateTypeString(type)).join('\n\n');

  // inputs
  const enrichedInputTypes = enrichTypes(klasses, inputs, fields);
  const inputTypesAsString = enrichedInputTypes
    .map((inputType): string => generateTypeString(inputType, true))
    .join('\n\n');

  // return based on presence of types/inputs
  if (!enrichedTypes.length) return inputTypesAsString;
  if (!enrichedInputTypes.length) return typesAsString;
  return typesAsString + '\n\n' + inputTypesAsString;
};

const generateTypeString = (type, isInputType = false): string => {
  const typeName = isInputType ? 'input' : 'type';

  return `${typeName} ${type.target.name} {\n${type.fields
    .map((field): string => `  ${field.propertyKey}: ${field.type}${field.notNullable ? '!' : ''}`)
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
                `Error: no type found for field ${field.propertyKey} on class ${obj.target.name}`,
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
        throw new Error(`Error: Class ${type.target.name} must contain at least 1 @Field`);
    },
  );

  return typesWithFields;
};

const translateToGraphqlType = (getType, passedType, fieldName, className): GraphQLScalarType => {
  // array fields
  if (getType.prototype === Array.prototype) {
    if (!passedType)
      throw new Error(
        `Error: Array ${fieldName} on ${className} has no type. Arrays must always be provided with a type.`,
      );

    const type = getGraphqlTypeFromType(passedType);
    return `[${type}]`;
  }

  // non-array fields
  return getGraphqlTypeFromType(getType, passedType);
};

const getGraphqlTypeFromType = (type, passedType = undefined): GraphQLScalarType => {
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
      throw new Error('Error: Incorrect field type for number, must be Int or Float');
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
