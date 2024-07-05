import { z } from "zod";

export const communeSchema = z.object({
	name: z.string({
		required_error: "Commune name is required"
	}),
	region: z.string({
		required_error: "Region is required"
	}),
	country: z.string({
		required_error: "Country is required"
	}),
}, {
	invalid_type_error: "Commune data is invalid, must by a object of type: { name: string; region: string; country: string; }"
});

export const addressSchema = z.object({
	street: z.string({
		required_error: "Street is required"
	}),
	number: z.number().int().positive("Street number is required"),
	floor: z.number().optional(),
	department: z.string().optional(),
	commune: communeSchema,
});
