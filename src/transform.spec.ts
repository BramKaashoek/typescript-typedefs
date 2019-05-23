import { Type, Field, fields, objectTypes } from './decorators';
import { expect } from 'chai';
import { generateTypeDefs } from './transform';
const removeWhiteSpace = (string: string): string => string.replace(/\s+/g, ' ');

describe('transformer', () => {
  beforeEach(() => {
    objectTypes.length = 0;
    fields.length = 0;
  });

  it('type is expected to have atleast 1 field', () => {
    @Type
    class EmptyClass {}
    try {
      generateTypeDefs([EmptyClass]);
    } catch (err) {
      expect(err).to.exist;
      expect(err.message).to.equal('@Type EmptyClass must contain at least 1 @Field');
    }
  });

  it('a type can have a string or boolean field', () => {
    @Type
    class StringClass {
      @Field()
      name: string;

      @Field()
      isTrue: boolean;
    }

    expect(removeWhiteSpace(generateTypeDefs([StringClass]))).to.equal(
      `type StringClass { name: String isTrue: Boolean }`,
    );
  });

  it('can have a string array or a boolean array', () => {
    @Type
    class TestClass {
      @Field(String)
      names: string[];
      @Field(Boolean)
      areTrue: boolean[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      `type TestClass { names: [String] areTrue: [Boolean] }`,
    );
  });

  it('can have an array type passed as string', () => {
    @Type
    class TestClass {
      @Field('String')
      names: string[];

      @Field('string')
      lowercase: string[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      `type TestClass { names: [String] lowercase: [String] }`,
    );
  });

  it('can handle floats and ints', () => {
    @Type
    class TestClass {
      @Field()
      someFloat: number;

      @Field('int')
      someInt: number;

      @Field('float')
      otherFloat: number;
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      `type TestClass { someFloat: Float someInt: Int otherFloat: Float }`,
    );
  });
});
