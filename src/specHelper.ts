import { Type, Field } from './decorators';
import { Course, Reader } from './generateTypeDefs.spec';
import { forwardRef } from './generateTypeDefs';
@Type()
export class Student {
  @Field(Course)
  courses: Course[];
}

@Type()
export class Book {
  @Field()
  name: string;

  @Field(forwardRef((): any => Reader))
  readers: Reader[];
}
