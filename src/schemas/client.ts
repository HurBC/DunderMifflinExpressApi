import { z } from "zod";
import { addressSchema, addressWithCommuneSchema } from "./locality";

export const clientSchema = z.object({
	name: z.string(),
	email: z.string().email().optional(),
	phone: z.string(),
	address: addressWithCommuneSchema,
	responsible: z.string(),
});

export const updateClientSchema = clientSchema
	.omit({ address: true })
	.partial()
	.extend({ address: addressSchema.optional() });

export const queryForClientsSchema = clientSchema
	.omit({ address: true })
	.extend({
		commune: z.string(),
		id: z.string(),
		all: z.enum(["true"]),
	})
	.partial();
