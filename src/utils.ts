import { z } from "zod";

export const getDefaults = <Schema extends z.AnyZodObject>(schema: Schema) =>
  Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault)
        return [key, value._def.defaultValue()];
      return [key, undefined];
    })
  );

export const getErrorMessage = (e: any) => {
  if (e instanceof Error) return e.message;
  if (e instanceof TypeError) return e.message;
  return String(e);
};
