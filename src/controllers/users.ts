import { Request, Response } from "express";
import {
	QueryUserType,
	QueryUsersType,
	UserJsonType,
	UserType,
} from "../types/UserTypes";
import bc from "bcryptjs";
import { queryForUsersSchema } from "../schemas/user";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { formatData, verifyQuery } from "../_utils";
import { User } from "../models/User";

export const register = async (req: Request, res: Response) => {
	const data: UserType = req.body;

	try {
		const hashedPassword = await bc.hash(data.password, 10);

		await new User().create({
			...data,
			password: hashedPassword,
			role: data.role ?? "employee",
			created_at: new Date(),
			updated_at: new Date(),
		});

		res.status(201).json({
			message: "User registered successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Error registering user",
			error,
		});
	}
};

export const insertMany = async (req: Request, res: Response) => {
	const data: UserType[] = req.body;

	try {
		const newUsers = data.map((user) => {
			const hashedPassword = bc.hashSync(user.password, 10);

			return formatData({
				data: user,
				newFields: {
					password: hashedPassword,
					role: user.role ?? "employee",
					created_at: new Date(),
					updated_at: new Date(),
				},
			}) as UserType;
		});

		await new User().bulkCreate(newUsers)

		res.status(200).json({
			message: "Users registered successfully"
		});
	} catch (error) {
		res.status(500).json({
			message: "Error registering user",
			error,
		});
	}
}

const getUsersBy = async (query: QueryUsersType, res: Response) => {
	try {
		const users = await new User().findBy(query, true);

		if (Array.isArray(users)) {
			const formatUsers = users.map((user) => {
				return formatData({
					data: user,
					deleteFields: ["password", "_id"],
					newFields: {
						fullName: {
							data: ["firstName", "lastName"],
							index: 3
						},
						id: {
							data: ["_id"],
							index: 0
						},
					},
				});
			});

			res.status(200).json(formatUsers);
		}
	} catch (error) {
		res.status(500).json({
			message: "Error fetching users",
			error,
		});
	}
};

const getUserBy = async (query: QueryUserType, res: Response) => {
	try {
		const user = await new User().findBy({
			_id: query.id ? new ObjectId(query.id) : undefined,
			firstName: query.firstName,
			lastName: query.lastName,
			email: query.email,
		});

		if (!user) {
			throw new Error("User not found");
		}

		if (!Array.isArray(user)) {
			res.status(200).json(formatData({
				data: user,
				deleteFields: ["password", "_id"],
				newFields: {
					fullName: {
						data: ["firstName", "lastName"],
						index: 3
					},
					id: {
						data: ["_id"],
						index: 0
					}
				},
			}));
		}
	} catch (error) {
		res.status(404).json({ message: "404 User not found" });
	}
};

export const getQuery = async (req: Request, res: Response) => {
	try {
		queryForUsersSchema.parse(req.query);

		const { many, ...query }: QueryUsersType = req.query;

		// verify query
		verifyQuery({ ...query }, { all: "true", without: ["role"] });

		// verify is many === "true" && role don't exist
		if (many === "true" && !query.role)
			throw new Error("'many' cannot be 'true' if 'role' is not defined");

		// throw error if many === "false" && role exist
		if (many === "false" && query.role)
			throw new Error("Cannot use 'role' if 'many' is false");

		if (many === "true") {
			await getUsersBy(query, res);
		} else {
			await getUserBy(query, res);
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({
				message: "Bad request",
				error: error.errors.map((error) => ({
					fields: error.path.join(", "),
					message: error.message,
				})),
			});
		} else if (error instanceof Error) {
			res.status(400).json({
				message: error.message,
			});
		} else
			res.status(500).json({
				message: "Error fetching users",
				error,
			});
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const data: UserJsonType = req.body;
		
		const user = await new User().update({
			_id: new ObjectId(data.id),
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			role: data.role,
			password: data.password ? await bc.hash(data.password, 10) : undefined,
			updated_at: new Date(),
		});

		if (!user) {
			throw new Error("User not found");
		}

		res.status(200).json({
			message: "User updated successfully",
			results: formatData({
				data: user,
				deleteFields: ["password", "_id"],
				newFields: {
					fullName: {
						data: ["firstName", "lastName"],
						index: 3
					},
					id: {
						data: ["_id"],
						index: 0
					},
				},
			})
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({
				message: "Bad request",
				error: error.errors.map((error) => ({
					fields: error.path.join(", "),
					message: error.message,
				})),
			});
		} else if (error instanceof Error) {
			res.status(400).json({
				message: error.message,
			});
		} else
			res.status(500).json({
				message: "Error updating user",
				error,
			});
	}
};

export const getUsers = async (_: any, res: Response) => {
	try {
		const users = await new User().findAll();

		const formatUsers = users.map((user) => {
			return formatData({
				data: user,
				deleteFields: ["password", "_id"],
				newFields: {
					fullName: {
						data: ["firstName", "lastName"],
						index: 3
					},
					id: {
						data: ["_id"],
						index: 0
					},
				},
			});
		});

		res.status(200).json({
			message: "Users fetched successfully",
			results: formatUsers,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error fetching users",
			error,
		});
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const id: string = req.query.id as string;

		const user = await new User().delete(new ObjectId(id));

		if (user.deletedCount == 0) throw new Error("User not found");

		res.status(200).json({
			message: "User deleted successfully",
			user
		});
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({
				message: error.message,
			});
		} else res.status(500).json({
			message: "Error deleting user",
		});
	}
};
