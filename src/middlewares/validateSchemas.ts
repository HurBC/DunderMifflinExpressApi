import { NextFunction, Request, Response } from "express";
import { Schema } from "zod";

export const validateSchema =
	(schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);

			next();
		} catch (error) {
			res.status(400).json(error);
		}
	};
	