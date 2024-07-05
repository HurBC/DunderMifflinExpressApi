import { ObjectId } from "mongodb"
import { AddressType, AddressWithCommuneType } from "./LocalityTypes";

// Omit Types
type ClientOmitType = "address" | "responsible" | "created_at" | "updated_at" | "_id";

export type ClientType = {
  _id?: ObjectId;
  name: string;
  email?: string;
  phone: string;
  address?: AddressType;
  responsible: ObjectId;
	created_at: Date;
	updated_at: Date;
}

export type ClientJsonType = Omit<ClientType, ClientOmitType> & {
  address?: AddressWithCommuneType;
  responsible: string;
}
