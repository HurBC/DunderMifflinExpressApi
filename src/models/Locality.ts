import { Collection, ObjectId } from "mongodb";
import {
	CommuneType,
} from "../types/LocalityTypes";
import { getDB } from "../db";

export class Commune {
	private collection: Collection<CommuneType>;

	constructor() {
		this.collection = getDB().collection<CommuneType>("communes");
		this.createIndexes();
	}

	async create(communeData: CommuneType) {
		const result = await this.collection.insertOne(communeData);

		return await this.collection.findOne({ _id: result.insertedId });
	}

	async findBy(data: CommuneType) {
		const commune = await this.collection.findOne(data);

		if (!commune) {
			return this.create(data);
		}

		return commune;
	}

	private async createIndexes() {
		await this.collection.createIndex(
			{ name: "text" },
			{ unique: true, name: "name_unique" }
		);
	}
}
