import { ObjectId } from "mongodb";
import { PartiallyOptional } from "./_utilsTypes";

// Omit types
type QueryUserOmitType =
	| "password"
	| "created_at"
	| "updated_at"
	| "role"
	| "_id";

type FilterUserOmitType = "password" | "created_at" | "updated_at" | "role";

export type RoleType = "employee" | "manager";

export type UserType = {
	_id?: ObjectId;
	firstName: string;
	lastName: string;
	role: RoleType;
	email: string;
	password: string;
	created_at?: Date;
	updated_at?: Date;
};

// Update User Type
export type UpdateUserType = PartiallyOptional<
	Omit<UserType, "created_at">,
	"_id"
>;

// Query's types
export type QueryUserType = Partial<Omit<UserType, QueryUserOmitType>> & {
	id?: string;
};

export type QueryUsersType = QueryUserType & {
	role?: RoleType;
	many?: "true" | "false";
};

// Filters type
export type FilterUserType = Partial<Omit<UserType, FilterUserOmitType>>;

export type FilterUsersType = FilterUserType & {
	role?: RoleType;
};

// Json
export type UserJsonType = Omit<UpdateUserType, "_id"> & {
	id: string;
};
