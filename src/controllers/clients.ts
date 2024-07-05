import { Request, Response } from "express";
import { ClientJsonType } from "../types/ClientTypes";
import { Client } from "../models/Client";
import { formatData, verifyJSON } from "../_utils";
import { ObjectId } from "mongodb";
import { AddressType, AddressWithCommuneType } from "../types/LocalityTypes";
import { Commune } from "../models/Locality";

export const createClient = async (req: Request, res: Response) => {
	const data: ClientJsonType = req.body;

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
      results
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

export const getClients = async (req: Request, res: Response) => {
	try {
		const clients = await new Client().findAll();

		res.status(200).json(clients);
	} catch (error) {
		res.status(500).json({
			message: "Error getting clients",
			error,
		});
	}
};
