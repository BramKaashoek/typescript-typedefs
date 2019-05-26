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
import { objectTypes, fields, IObjectType, IField } from './decorators';

export const generateTypeDefs = (klasses): string => {
  const enrichedTypes = enrichTypes(klasses, objectTypes, fields);
  return enrichedTypes.map(generateTypeDef).join(`
  `);
};

const generateTypeDef = (objectType): string => {
  return `type ${objectType.target.name} {\n ${objectType.fields.map(
    (field): string => `${field.propertyKey}: ${field.type}`,
  ).join(`
  `)}\n}`;
};

const enrichTypes = (klasses, objectTypes, fields): IObjectType[] => {
  const names = klasses.map((klass): string => klass.name);
  const selectedObjectTypes = objectTypes.filter((e): boolean => names.includes(e.target.name));
  const objectsWithFields = selectedObjectTypes.map(
    (obj): IObjectType => {
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
            );
            return field;
          },
        );
      return obj;
    },
  );

  return objectsWithFields;
};

const translateToGraphqlType = (getType, passedType, fieldName, className): GraphQLScalarType => {
  // array fields
  if (getType.prototype === Array.prototype) {
    if (!passedType)
      throw new Error(
        `Array ${fieldName} on ${className} has no type. Arrays must always be provided with a type.`,
      );

    const type = getGraphqlTypeFromType(passedType);
    if (type) return `[${type}]`;
    throw new Error(`Error: unknown type ${passedType} for Field ${fieldName} on ${className}.`);
  }

  // non-array basic type fields
  const type = getGraphqlTypeFromType(getType, passedType);
  if (type) return type;
  throw new Error(`unknown type for ${getType.prototype} ${fieldName} on ${className}`);
};

const getGraphqlTypeFromType = (getType, passedType?): GraphQLScalarType => {
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

  if (objectTypes.some((e): boolean => e.target.name === getType.name)) return getType.name;
  return undefined;
};
