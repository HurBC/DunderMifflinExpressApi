import { Collection, Document, ObjectId } from "mongodb";
import {
	ClientJsonType,
	ClientType,
	ClientWithResponsibleType,
	QueryClientType,
	UpdateClientType,
} from "../types/ClientTypes";
import { getDB } from "../db";
import { cleanData, formatData } from "../_utils";

export class Client {
	private collection: Collection<ClientType>;

	constructor() {
		this.collection = getDB().collection<ClientType>("clients");
	}

	async create(clientData: ClientJsonType) {
		const cleanedClient = cleanData(clientData, ["address"]);

		const formatClient = formatData({ data: cleanedClient }) as ClientType;

		const results = await this.collection.insertOne(formatClient);

		return await this.collection.findOne({ _id: results.insertedId });
	}

	async update(clientData: UpdateClientType) {
		const { _id, ...data } = clientData;

		const cleanedClient = cleanData(data, [
			"address",
			"email",
			"name",
			"phone",
			"responsible",
		]);

		return await this.collection.findOneAndUpdate(
			{ _id },
			{ $set: cleanedClient },
			{
				returnDocument: "after",
			}
		);
	}

	async delete(_id: ObjectId) {
		return await this.collection.deleteOne({ _id });
	}

	async findBy(query: QueryClientType) {
		let formatQuery = formatData({
			data: query,
			newFields: { _id: ["id"] },
			deleteFields: ["id"],
		});

		let cleanedQuery = cleanData(formatQuery, ["_id", "email", "name", "phone"]);

		const pipeline = [
			{
				$match: cleanedQuery,
			},
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
					from: "communes",
					localField: "address.commune",
					foreignField: "_id",
					as: "commune",
				},
			},
			{ $unwind: "$commune" },
			{
				$project: {
					_id: 1,
					name: 1,
					email: 1,
					phone: 1,
					responsible: {
						_id: "$responsible._id",
						firstName: "$responsible.firstName",
						lastName: "$responsible.lastName"
					},
					address: {
						street: 1,
						number: 1,
						commune: "$commune",
					},
				},
			},
		];

		return (await this.collection
			.aggregate(pipeline)
			.toArray()) as ClientWithResponsibleType[];
	}

	async findAllBy(query: QueryClientType) {
		console.log(query);

		const { commune, ...rest } = cleanData(query, [
			"id",
			"email",
			"name",
			"phone",
			"responsible",
			"commune",
		]);

		console.log({ commune, rest });

		const pipeline: Document[] = [
			{
				$match: rest,
			},
			{
				$lookup: {
					from: "users",
					localField: "responsible",
					foreignField: "_id",
					as: "responsible",
				},
			},
			{ $unwind: "$responsible" },
		];

		if (commune) {
			pipeline.push({
				$match: { "address.commune": commune },
			});
		}

		pipeline.push(
			{
				$lookup: {
					from: "communes",
					localField: "address.commune",
					foreignField: "_id",
					as: "commune",
				},
			},
			{ $unwind: "$commune" },
			{
				$project: {
					_id: 1,
					name: 1,
					email: 1,
					phone: 1,
					responsible: "$responsible",
					address: {
						street: 1,
						number: 1,
						commune: "$commune",
					},
				},
			}
		);

		return (await this.collection
			.aggregate(pipeline)
			.toArray()) as ClientWithResponsibleType[];
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
					from: "communes",
					localField: "address.commune",
					foreignField: "_id",
					as: "commune",
				},
			},
			{ $unwind: "$commune" },
			{
				$project: {
					_id: 1,
					name: 1,
					email: 1,
					phone: 1,
					responsible: "$responsible",
					address: {
						street: 1,
						number: 1,
						commune: "$commune",
					},
				},
			},
		];

		return (await this.collection
			.aggregate(pipeline)
			.toArray()) as ClientWithResponsibleType[];
	}
}
