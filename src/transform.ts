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

const generateTypeDef = (objectType): any => {
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
    if (typeof passedType === 'string')
      return `[${passedType.charAt(0).toUpperCase() + passedType.slice(1)}]`;

    switch (passedType) {
    case String:
      return `[${GraphQLString}]`;
    case Boolean:
      return `[${GraphQLBoolean}]`;
    case Number:
      return `[${GraphQLFloat}]`;
    }
    if (objectTypes.some((e): boolean => e.target.name === passedType.name))
      return `[${passedType.name}]`;

    throw new Error(
      `Array ${fieldName} on ${className} has no type. Arrays must always be provided with a type.`,
    );
  }

  // non-array basic type fields
  switch (getType.prototype) {
  case String.prototype:
    return GraphQLString;
  case Boolean.prototype:
    return GraphQLBoolean;
  case Number.prototype:
    if (!passedType) return GraphQLFloat;
    if (passedType.toLowerCase() === 'float') return GraphQLFloat;
    if (passedType.toLowerCase() === 'int') return GraphQLInt;
    throw new Error(
      `Incorrect type passed for ${fieldName} on ${className}, must be 'Int' or 'Float'`,
    );
  }
  // nested types
  if (objectTypes.some((e): boolean => e.target.name === getType.name)) return getType.name;

  throw new Error(`unknown type for ${getType.prototype} ${fieldName} on ${className}`);
};
