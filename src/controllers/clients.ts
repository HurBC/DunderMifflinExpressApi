import { Request, Response } from "express";
import {
	ClientJsonType,
	ClientJsonWithCommuneType,
	QueryClientType,
} from "../types/ClientTypes";
import { Client } from "../models/Client";
import { formatData, formatResponsible, verifyJSON, verifyQuery } from "../_utils";
import { ObjectId } from "mongodb";
import { AddressType, AddressWithCommuneType } from "../types/LocalityTypes";
import { Commune } from "../models/Locality";
import { queryForClientsSchema } from "../schemas/client";
import { z } from "zod";

export const createClient = async (req: Request, res: Response) => {
	const data: ClientJsonWithCommuneType = req.body;

	try {
		verifyJSON(data, ["name", "phone"], "no-empty-string");

		let address: AddressType | null = null;

		if (data.address) {
			verifyJSON(data.address, ["street"], "no-empty-string");

			const { commune, ...rest }: AddressWithCommuneType = data.address;

			verifyJSON(commune, "all", "no-empty-string");

			const newCommune = await new Commune().findBy(commune);

			if (!newCommune) throw new Error("Commune not found");

			address = {
				...rest,
				commune: newCommune._id,
			};
		}

		const newClient = formatData({
			data: data,
			newFields: {
				created_at: new Date(),
				updated_at: new Date(),
				responsible: new ObjectId(data.responsible),
				address: address,
			},
			deleteFields: ["responsible", "address"],
		}) as ClientJsonType;

		const results = await new Client().create(newClient);

		res.status(201).json({
			message: "Client registered successfully",
			results,
		});
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({
				message: error.message,
			});
		} else
			res.status(500).json({
				message: "Error creating client",
			});
	}
};

const getAllCLients = async (res: Response) => {
	try {
		const clients = await new Client().findAll();

		const formatClients = clients.map((client) => {
			const formatUser = formatResponsible(client.responsible);

			return formatData({
				data: client,
				newFields: { responsible: formatUser },
				deleteFields: ["responsible"],
			});
		});

		res.status(200).json(formatClients);
	} catch (error) {
		res.status(500).json({
			message: "Error getting clients",
			error,
		});
	}
};

const getAllClientsBy = async (query: QueryClientType, res: Response) => {
	try {
		const clients = await new Client().findAllBy(query);

		const formatClients = clients.map((client) => {
			const formatUser = formatResponsible(client.responsible);

			return formatData({
				data: client,
				newFields: { responsible: formatUser },
				deleteFields: ["responsible"],
			});
		});

		res.status(200).json(formatClients);
	} catch (error) {
		res.status(500).json({
			message: "Error getting clients",
			error,
		});
	}
};

const getClientBy = async (query: QueryClientType, res: Response) => {
	try {
		const formatQuery = formatData({
			data: query,
			newFields: {
				id: query.id ? new ObjectId(query.id) : null,
			},
			deleteFields: ["id"],
		});

		const clients = await new Client().findBy(formatQuery);
		const client = clients[0];

		if (!client) throw new Error("Client not found");

		const formatUser = formatResponsible(client.responsible);

		res.status(200).json(
			formatData({
				data: client,
				newFields: {
					responsible: formatUser,
				},
				deleteFields: ["responsible"],
			})
		);
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({
				message: error.message,
			});
		} else
			res.status(500).json({
				message: "Error getting client",
				error,
			});
	}
};

export const getClients = async (req: Request, res: Response) => {
	try {
		queryForClientsSchema.parse(req.query);

		const query: QueryClientType = req.query;
		const { all, commune, responsible, ...rest }: QueryClientType =
			req.query;

		if ((commune || responsible) && !all) {
			throw new Error("Cannot use 'commune' or 'responsible' without 'all'");
		}

		verifyQuery(
			{ ...query },
			["name", "phone", "email", "id"],
			["all", "commune", "responsible"]
		);

		if (all && all === "true") {
			if (commune || responsible) {
				return getAllClientsBy(
					{
						commune: commune ? new ObjectId(commune) : undefined,
						responsible: responsible
							? new ObjectId(responsible)
							: undefined,
					},
					res
				);
			} else {
				return getAllCLients(res);
			}
		}

		return getClientBy(rest, res);
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
				message: "Error getting clients",
				error,
			});
	}
};

export const updateClients = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const data: ClientJsonType = req.body;

		const client = await new Client().update({
			_id: new ObjectId(id),
			name: data.name,
			phone: data.phone,
			email: data.email,
			address: data.address,
			responsible: data.responsible
				? new ObjectId(data.responsible)
				: undefined,
			updated_at: new Date(),
		});

		if (!client) throw new Error("Client not found");

		res.json({ ...client });
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({
				message: error.message,
			});
		} else
			res.status(500).json({
				message: "Error updating client",
				error,
			});
	}
};

export const deleteClient = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const client = await new Client().delete(new ObjectId(id));

		if (client.deletedCount === 0) throw new Error("Client not found");

		res.json({ message: "Client deleted" });
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({
				message: error.message,
			});
		} else
			res.status(500).json({
				message: "Error deleting client",
				error,
			});
	}
};
