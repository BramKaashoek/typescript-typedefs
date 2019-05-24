# Typescript-Typedefs

A small package meant to make it easier to combine (Apollo-)GraphQL and typescript.

With this package there is no need to define both typescript interfaces and GraphQL typeDefs. Just define your model as a class, use the decorators and call the `generateTypeDefs` function.

## Example

```
    @Type()
    class Person{
        @Field()
        name: string

        @Field(String)
        friendNames: string[]

        @Field('Int')
        apartmentNumber: number

        @Field()
        universityGpa: number
    }
```

followed by

```
generateTypeDefs([Person])
```

results in

```
type Person {
  name: String
  friendNames: [String]
  apartmentNumber: Int
  universityGpa: Float
}
```

which can then be used in `makeExecutableSchema()`
