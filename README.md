# Typescript-Typedefs

A small package meant to make it easier to combine (Apollo-)GraphQL and Typescript.

With this package there is no need to define both typescript interfaces and GraphQL typeDefs. Just define your model as a class, use the decorators and call the `generateTypeDefs` function.

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

        @Field(Int)
        room: number

        @Field()
        gpa: number

        @Field(Course)
        courses: Course[]
    }

  generateTypeDefs([Course, Person])
```

results in

```
type Course {
 name: String
}

type Student {
  id: ID
  name: String
  friendNames: [String]
  room: Int
  gpa: Float
  courses: [Course]
}
```

which can then be used in `makeExecutableSchema()` from [Apollo server.](https://www.npmjs.com/package/apollo-server)

## Todo

- Add nullables array elements: `Field({nullable: elementsAndArray})`
- Add syntax for explicit arrays: `Field([String])`
- Add export typeDefs to file
