import { z } from 'zod';

export const createUserSchema = z.object({
  gender: z.enum(['male', 'female']),
  costume: z.object({
    skin: z.string().regex(/^skin_\d+$/, 'Invalid skin format. Expected: skin_0'),
    hair: z.string().regex(/^hair_\d+_c\d+$/, 'Invalid hair format. Expected: hair_0_c0'),
    outfit: z.string().regex(/^outfit_\d+$/, 'Invalid outfit format. Expected: outfit_0'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
