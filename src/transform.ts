import {
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
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

    const type =
      typeof passedType === 'string'
        ? getGraphqlTypeFromString(passedType)
        : getGraphqlTypeFromType(passedType);

    if (type) return `[${type}]`;
    throw new Error(`Error: unknown type ${passedType} for Field ${fieldName} on ${className}.`);
  }

  // non-array basic type fields
  const type = getGraphqlTypeFromType(getType, passedType);
  if (type) return type;

  throw new Error(`unknown type for ${getType.prototype} ${fieldName} on ${className}`);
};

const getGraphqlTypeFromString = (type: string): GraphQLScalarType | string => {
  switch (type.toLowerCase()) {
  case 'string':
    return GraphQLString;
  case 'int':
    return GraphQLInt;
  case 'float':
    return GraphQLFloat;
  case 'bool':
  case 'boolean':
    return GraphQLBoolean;
  }

  if (objectTypes.some((e): boolean => e.target.name === type)) return type;
  return undefined;
};

const getGraphqlTypeFromType = (getType, passedType?: string): GraphQLScalarType => {
  switch (getType.prototype) {
  case String.prototype:
    return GraphQLString;
  case Boolean.prototype:
    return GraphQLBoolean;
  case Number.prototype:
    if (!passedType) return GraphQLFloat;
    if (passedType.toLowerCase() === 'int' || passedType.toLowerCase() === 'float')
      return getGraphqlTypeFromString(passedType);
    throw new Error('Incorrect field type for number, must be \'Int\' or \'Float\'');
  }

  if (objectTypes.some((e): boolean => e.target.name === getType.name)) return getType.name;
  return undefined;
};
