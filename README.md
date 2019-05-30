# Typescript-Typedefs

When using [Apollo GrapQL](https://www.npmjs.com/package/apollo-server) you need to define the typeDefs for your schema. When using [TypeScript](https://www.npmjs.com/package/typescript) you need to define interfaces to add proper typings. Because doing both of these things is rather a lot like code duplication, this package was created.

With this package you can simply define your model as a class, use the provided [TypeScript decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) and call the `generateTypeDefs` function, which will automatically generate your typeDefs for you.

## Installation Guide

### Install the packages

```
npm i typescript-typedefs
```

### Update tsconfig

Since we use decorators, [tsconfig must be configured](https://www.typescriptlang.org/docs/handbook/decorators.html) to work with them.

```
{
  "compilerOptions: {
    ...
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

## Exports

This package exports

- Type - used as @Type() to decorate a class
- Input - used as @Input() to decorate a class
- Field - used as @Field(), @Field(String) or @Field({type: Int, notNullable: true}) to decorate a class property
- Int - used in an @Field() decorator
- Float - used in an @Field() decorator
- ID - used in an @Field() decorator
- generateTypeDefs - function used to create a typeDefs string from the array of decorated classes it recieves as argument.

## Example

```
import {Type, Field, ID, Int, generateTypeDefs} from 'typescript-typedefs'

    @Type()
    class Course {
      @Field()
      name: string
    }

    @Type()
    class Student {
        @Field(ID)
        id: string

        @Field()
        name: string

        @Field(String)
        friendNames: string[]

        @Field({type: Int, notNullable: true})
        room: number

        @Field()
        gpa: number

        @Field(Course)
        courses: Course[]
    }

  const generatedTypeDefs = generateTypeDefs([Course, Student])
```

results in a string:

```
type Course {
 name: String
}

type Student {
  id: ID
  name: String
  friendNames: [String]
  room: Int!
  gpa: Float
  courses: [Course]
}
```

which can then be used in `makeExecutableSchema()` from [Apollo server.](https://www.npmjs.com/package/apollo-server)

## FAQ

### Why won't circular references work?

This packages makes use of [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) which has difficulties with circular references. To work around this, you can implement something like this:

```
@Type()
class Course {
  @Field(Student)
  students: Student[]
}

@Type()
class Student {
  courses: Course[]
}

const generatedTypeDefs = generateTypeDefs([Course, Student])

const extendTypeDefs = gql`
  extend type Student {
    courses: [Course]
  }
`
const schema = makeExecutableSchema({
  typeDefs: [generatedTypeDefs, extendedTypeDefs],
  resolvers: merge(...)
})

```

### Why classes and not interfaces?

Interfaces are not available at runtime, classes are.

## Todo

- Add documentation to types/inputs
- Add nullables array elements: `Field({nullable: elementsAndArray})`
- Add syntax for explicit arrays: `Field([String])`
