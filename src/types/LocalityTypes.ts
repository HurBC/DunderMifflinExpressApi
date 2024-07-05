import { ObjectId } from "mongodb";

export type CommuneType = {
	_id?: ObjectId;
	name: string;
	region: string;
	country: string;
	created_at?: Date;
	updated_at?: Date;
};

export type AddressType = {
	street: string;
	number: number;
	floor?: number;
	department?: string;
	commune: ObjectId;
	created_at?: Date;
	updated_at?: Date;
};

// Query's types
export type QueryCommuneType = Partial<Omit<CommuneType, "_id">>

export type AddressWithCommuneType = Omit<AddressType, "commune"> & {
	commune: CommuneType;
};
