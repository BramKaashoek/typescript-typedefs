import { Int, Float, ID } from './types';
import { Type, InputType, Field, types, fields, inputTypes } from './decorators';
import { expect } from 'chai';
import { generateTypeDefs } from './generateTypeDefs';

const removeWhiteSpace = (string: string): string => string.replace(/\s+/g, ' ');

describe('Type and InputType', (): void => {
  beforeEach(
    (): void => {
      types.length = 0;
      inputTypes.length = 0;
      fields.length = 0;
    },
  );

  it('Type is expected to have atleast 1 field', (): void => {
    let error: any = {};

    @Type()
    class TestClass {}

    try {
      generateTypeDefs([TestClass]);
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.message).to.equal('Class TestClass must contain at least 1 @Field');
  });

  it('InputType is expected to have atleast 1 field', (): void => {
    let error: any = {};

    @InputType()
    class TestClass {}

    try {
      generateTypeDefs([TestClass]);
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.message).to.equal('Class TestClass must contain at least 1 @Field');
  });
});

describe('Strings and bools', (): void => {
  beforeEach(
    (): void => {
      types.length = 0;
      inputTypes.length = 0;
      fields.length = 0;
    },
  );

  it('aA type can have a string or boolean field', (): void => {
    @Type()
    class TestClass {
      @Field()
      name: string;

      @Field()
      isTrue: boolean;
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { name: String! isTrue: Boolean! }',
    );
  });

  it('can have a string array or a boolean array', (): void => {
    @Type()
    class TestClass {
      @Field(String)
      names: string[];

      @Field(Boolean)
      areTrue: boolean[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { names: [String]! areTrue: [Boolean]! }',
    );
  });
});

describe('Floats and ints', (): void => {
  beforeEach(
    (): void => {
      types.length = 0;
      inputTypes.length = 0;
      fields.length = 0;
    },
  );

  it('can handle float and int fields', (): void => {
    @Type()
    class TestClass {
      @Field()
      someFloat: number;

      @Field(Int)
      someInt: number;

      @Field(Float)
      otherFloat: number;
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { someFloat: Float! someInt: Int! otherFloat: Float! }',
    );
  });

  it('can handle float and int arrays', (): void => {
    @Type()
    class TestClass {
      @Field(Float)
      floatArray: number[];

      @Field(Number)
      otherFloatArray: number[];

      @Field(Int)
      intArray: number[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { floatArray: [Float]! otherFloatArray: [Float]! intArray: [Int]! }',
    );
  });
});

describe('Nested Types', (): void => {
  beforeEach(
    (): void => {
      types.length = 0;
      inputTypes.length = 0;
      fields.length = 0;
    },
  );

  it('can handle nested types fields and arrays', (): void => {
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

    expect(removeWhiteSpace(generateTypeDefs([Parent, Child]))).to.equal(
      'type Child { name: String! } type Parent { child: Child! children: [Child]! }',
    );
  });
});

describe('IDs', (): void => {
  beforeEach(
    (): void => {
      types.length = 0;
      inputTypes.length = 0;
      fields.length = 0;
    },
  );

  it('can handle IDs and ID arrays', (): void => {
    @Type()
    class TestClass {
      @Field(ID)
      id: string;

      @Field(ID)
      ids: string[];
    }
    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { id: ID! ids: [ID]! }',
    );
  });
});

describe('Nullable values', (): void => {
  beforeEach(
    (): void => {
      types.length = 0;
      inputTypes.length = 0;
      fields.length = 0;
    },
  );

  it('can handle object args', (): void => {
    @Type()
    class TestClass {
      @Field({ type: ID })
      id: string;
    }
    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal('type TestClass { id: ID! }');
  });

  it('can handle nullable fields', (): void => {
    @Type()
    class TestClass {
      @Field({ type: ID, nullable: true })
      id?: string;
    }
    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal('type TestClass { id: ID }');
  });
});

describe('InputType', (): void => {
  beforeEach(
    (): void => {
      types.length = 0;
      inputTypes.length = 0;
      fields.length = 0;
    },
  );

  it('can handle inputTypes with all fields', (): void => {
    @InputType()
    class Course {
      @Field()
      name: string;
    }

    @InputType()
    class TestClass {
      @Field(ID)
      id: string;

      @Field()
      name: string;

      @Field()
      gpa: number;

      @Field(Int)
      classRank: number;

      @Field(Course)
      classes: Course[];
    }
    expect(removeWhiteSpace(generateTypeDefs([TestClass, Course]))).to.equal(
      'inputType Course { name: String! } inputType TestClass { id: ID! name: String! gpa: Float! classRank: Int! classes: [Course]! }',
    );
  });
});
