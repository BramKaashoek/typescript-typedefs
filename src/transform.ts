import { GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt } from 'graphql';
import 'reflect-metadata';
import { objectTypes, fields } from './decorators';

export const generateTypeDefs = (klasses): string => {
  const enrichedTypes = enrichTypes(klasses, objectTypes, fields);
  return enrichedTypes.map(generateTypeDef).join(`
  `);
};

const generateTypeDef = (objectType): any => {
  return `type ${objectType.target.name} {\n ${objectType.fields.map(
    field => `${field.propertyKey}: ${field.type}`,
  ).join(`
  `)}\n}`;
};

const enrichTypes = (klasses, objectTypes, fields) => {
  const names = klasses.map(klass => klass.name);
  const selectedObjectTypes = objectTypes.filter(e => names.includes(e.target.name));
  const objectsWithFields = selectedObjectTypes.map(obj => {
    obj.fields = fields
      .filter(field => field.target.name === obj.target.name)
      .map(field => {
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
      });
    return obj;
  });

  return objectsWithFields;
};

const translateToGraphqlType = (getType, passedType, fieldName, className) => {
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

    throw new Error(
      `Array ${fieldName} on ${className} has no type. Arrays must always be provided with a type.`,
    );
  }

  switch (getType.prototype) {
    case String.prototype:
      return getType.name;
    case Boolean.prototype:
      return GraphQLBoolean;
    case Number.prototype:
      if (!passedType) return GraphQLFloat;
      if (passedType.toLowerCase() === 'float') return GraphQLFloat;
      if (passedType.toLowerCase() === 'int') return GraphQLInt;
      throw new Error(
        `Incorrect type passed for ${fieldName} on ${className}, must be 'Int' or 'Float'`,
      );

    default:
      throw new Error(`unknown type for ${getType.prototype} ${fieldName} on ${className}`);
  }
};
