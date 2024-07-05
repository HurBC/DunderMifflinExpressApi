import { Collection, ObjectId } from "mongodb";
import {
  FilterUserType,
	FilterUsersType,
	UpdateUserType,
	UserType,
} from "../types/UserTypes";
import { getDB } from "../db";
import { cleanData } from "../_utils";

export class User {
	private collection: Collection<UserType>;

	constructor() {
		this.collection = getDB().collection<UserType>("users");
		this.createIndexes();
	}

	async create(userData: UserType) {
		const result = await this.collection.insertOne(userData);

		return await this.collection.findOne({ _id: result.insertedId });
	}

	async bulkCreate(usersData: UserType[]) {
		const results = await this.collection.insertMany(usersData);

		return results;
	}

	async findAll() {
		return await this.collection.find().toArray();
	}

	async findBy(
		query: FilterUserType | FilterUsersType,
		many: boolean = false
	) {
    const cleanedQuery = cleanData(query, ["_id", "email", "firstName", "lastName"]);

		if (many) {
			return await this.collection.find(cleanedQuery).toArray();
		}

		return await this.collection.findOne(cleanedQuery);
	}

	async update(userData: UpdateUserType) {
		const { _id, ...data } = userData;

    const cleanedQuery = cleanData(data, ["email", "firstName", "lastName", "password", "role"]);

		return await this.collection.findOneAndUpdate(
			{
				_id: _id
			},
			{
				$set: cleanedQuery,
			},
			{
				returnDocument: "after",
			}
		);
	}

	async delete(_id: ObjectId) {
		return await this.collection.deleteOne({ _id });
	}

	private async createIndexes() {
		await this.collection.createIndex(
			{ email: 1 },
			{ unique: true, name: "email_unique" }
		);
	}
}
