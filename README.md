# Typescript-Typedefs !Beta version!

A small package meant to make it easier to combine (Apollo-)GraphQL and Typescript.

With this package there is no need to define both typescript interfaces and GraphQL typeDefs. Just define your model as a class, use the decorators and call the `generateTypeDefs` function.

## Example

```
import {Type, Field, ID, Int, generateTypeDefs} from 'typescript-typedefs'

    @Type()
    class Person{
        @Field(ID)
        id: string

        @Field()
        name: string

        @Field(String)
        friendNames: string[]

        @Field(Int)
        apartmentNumber: number

        @Field()
        universityGpa: number
    }

  generateTypeDefs([Person])
```

results in

```
type Person {
  id: ID
  name: String
  friendNames: [String]
  apartmentNumber: Int
  universityGpa: Float
}
```

which can then be used in `makeExecutableSchema()` from [Apollo server.](https://www.npmjs.com/package/apollo-server)

## Todo

- Add nullables (including nullable arrays and nullable array members)
- Add inputType
- Add export to file
