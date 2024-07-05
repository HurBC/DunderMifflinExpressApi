import { z } from "zod";
import { addressSchema } from "./locality";

export const clientSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  address: addressSchema.optional(),
  responsible: z.string()
})