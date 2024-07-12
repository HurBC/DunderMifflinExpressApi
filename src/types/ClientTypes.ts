import { ObjectId } from "mongodb";
import { AddressType, AddressWithCommuneType } from "./LocalityTypes";
import { UserType } from "./UserTypes";
import { PartiallyOptional } from "./_utilsTypes";

// Omit Types
type ClientOmitType =
	| "address"
	| "responsible"
	| "created_at"
	| "updated_at"
	| "_id";

type QueryClientOmitType =
		| "address"
		| "created_at"
		| "updated_at"
		| "_id";

export type ClientType = {
	_id?: ObjectId;
	name: string;
	email?: string;
	phone: string;
	address?: AddressType;
	responsible: ObjectId;
	created_at: Date;
	updated_at: Date;
};

export type ClientWithResponsibleType = {
	_id: ObjectId;
	name: string;
	email?: string;
	phone: string;
	address: AddressWithCommuneType;
	responsible: UserType;
};

// Update client type
export type UpdateClientType = PartiallyOptional<
	Omit<ClientType, "created_at">,
	"_id"
>;

// Json client type
export type ClientJsonWithCommuneType = Omit<UpdateClientType, ClientOmitType> & {
	address?: AddressWithCommuneType;
	responsible?: string;
};

export type ClientJsonType = Omit<UpdateClientType, ClientOmitType> & {
	address?: AddressType;
	responsible?: string;
};

export type QueryClientType = Partial<Omit<ClientType, QueryClientOmitType>> & {
	commune?: ObjectId;
	id?: ObjectId;
	all?: "true";
}
