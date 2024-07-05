import { Collection } from "mongodb";
import { ClientJsonType, ClientType } from "../types/ClientTypes";
import { getDB } from "../db";
import { cleanData, formatData } from "../_utils";
export class Client {
	private collection: Collection<ClientType>;

	constructor() {
		this.collection = getDB().collection<ClientType>("clients");
	}

	async create(clientData: ClientJsonType) {
		const cleanedClient = cleanData(clientData, ["address"]);

		const formatClient = formatData({data: cleanedClient}) as ClientType;

		const results = await this.collection.insertOne(formatClient);

		return await this.collection.findOne({ _id: results.insertedId });
	}

	async findAll() {
		const pipeline = [
			{
				$lookup: {
					from: "users",
					localField: "responsible",
					foreignField: "_id",
					as: "responsible",
				},
			},
			{ $unwind: "$responsible" },
			{
				$lookup: {
					from: "addresses",
					localField: "address",
					foreignField: "_id",
					as: "address",
				},
			},
			{ $unwind: "$address" },
			{
				$lookup: {
					from: "communes",
					localField: "address.communeId",
					foreignField: "_id",
					as: "commune",
				},
			},
			{ $unwind: "$commune" },
		];

		return await this.collection.aggregate(pipeline).toArray();
	}
}
