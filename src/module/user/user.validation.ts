import * as z from 'zod';

export const addUserSchema = z
  .strictObject({
    name: z.string().min(3).max(50),
    age: z.number(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
        {
          message:
            'Password must contain at least one lowercase letter, one uppercase letter, one digit and one special character',
        },
      ),
    cPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
        {
          message:
            'Password must contain at least one lowercase letter, one uppercase letter, one digit and one special character',
        },
      ),
  })
  .superRefine((data, ctx) => {
    if(data.password !== data.cPassword){
      ctx.addIssue({
        code: "custom",
        path: ["cPassword"],
        message: 'Password does not match',
      });
    }
  });
