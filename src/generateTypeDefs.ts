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
  // all types
  const enrichedTypes = enrichTypes(klasses, types, fields);
  const typesAsString = enrichedTypes.map((type): string => generateTypeString(type)).join('\n\n');

  // all inputTypes
  const enrichedInputTypes = enrichTypes(klasses, inputs, fields);
  const inputTypesAsString = enrichedInputTypes
    .map((inputType): string => generateTypeString(inputType, true))
    .join('\n\n');

  // return based on presence of types/inputTypes
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
        .filter((field): boolean => field.target.name === obj.target.name)
        .map(
          (field): IField => {
            const getType = Reflect.getMetadata(
              'design:type',
              field.target.prototype,
              field.propertyKey,
            );
            field.type = translateToGraphqlType(
              getType,
              field.passedType,
              field.propertyKey,
              obj.target.name,
              selectedTypes,
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

const translateToGraphqlType = (
  getType,
  passedType,
  fieldName,
  className,
  types,
): GraphQLScalarType => {
  // array fields
  if (getType.prototype === Array.prototype) {
    if (!passedType)
      throw new Error(
        `Array ${fieldName} on ${className} has no type. Arrays must always be provided with a type.`,
      );

    const type = getGraphqlTypeFromType(passedType, types);
    if (type) return `[${type}]`;
    throw new Error(
      `Error: unknown type ${passedType} for Field ${fieldName} on ${className}. If it's a class, did you forget to add it to generateTypeDefs()?`,
    );
  }

  // non-array fields
  const type = getGraphqlTypeFromType(getType, types, passedType);
  if (type) return type;
  throw new Error(
    `unknown type for ${fieldName}: ${
      getType.name
    } on ${className}. If it's a class, did you forget to add it to generateTypeDefs()?`,
  );
};

const getGraphqlTypeFromType = (getType, types, passedType?): GraphQLScalarType => {
  // if type is a standard type
  switch (getType.prototype) {
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
  }

  // if type is another class which is also being generated
  if (types.some((e): boolean => e.target.name === getType.name)) return getType.name;

  return undefined;
};
