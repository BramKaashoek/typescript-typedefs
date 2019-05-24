import { Type, Field, objectTypes, fields } from './decorators';
import { expect } from 'chai';
import { generateTypeDefs } from './transform';
const removeWhiteSpace = (string: string): string => string.replace(/\s+/g, ' ');

describe('ObjectType and InputType', () => {
  beforeEach(() => {
    objectTypes.length = 0;
    fields.length = 0;
  });

  it('type is expected to have atleast 1 field', () => {
    @Type()
    class TestClass {}
    try {
      generateTypeDefs([TestClass]);
    } catch (err) {
      expect(err).to.exist;
      expect(err.message).to.equal('@Type TestClass must contain at least 1 @Field');
    }
  });

  it('input is expected to have atleast 1 field');
});

describe('strings and bools', () => {
  beforeEach(() => {
    objectTypes.length = 0;
    fields.length = 0;
  });

  it('a type can have a string or boolean field', () => {
    @Type()
    class TestClass {
      @Field()
      name: string;

      @Field()
      isTrue: boolean;
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      `type TestClass { name: String isTrue: Boolean }`,
    );
  });

  it('can have a string array or a boolean array', () => {
    @Type()
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
    @Type()
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
});

describe('floats and ints', () => {
  beforeEach(() => {
    objectTypes.length = 0;
    fields.length = 0;
  });

  it('can handle float and int fields', () => {
    @Type()
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

  it('can handle float and int arrays', () => {
    @Type()
    class TestClass {
      @Field('float')
      floatArray: number[];

      @Field(Number)
      otherFloatArray: number[];

      @Field('int')
      intArray: number[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      `type TestClass { floatArray: [Float] otherFloatArray: [Float] intArray: [Int] }`,
    );
  });
});

describe('nested Types', () => {
  beforeEach(() => {
    objectTypes.length = 0;
    fields.length = 0;
  });

  it('can handle nested types fields and arrays', () => {
    @Type()
    class Child {
      @Field()
      name: string;
    }

    @Type()
    class Parent {
      @Field()
      child: Child;

      @Field(Child)
      children: Child[];
    }

    expect(removeWhiteSpace(generateTypeDefs([Parent]))).to.equal(
      `type Parent { child: Child children: [Child] }`,
    );
  });
});

describe('nullable values', () => {
  it('can handle nullable fields');
  it('can handle nullable arrays');
});
