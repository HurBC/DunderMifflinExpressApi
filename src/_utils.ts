import { ObjectId } from "mongodb";
import { AddressType } from "./types/LocalityTypes";
import { UserType } from "./types/UserTypes";

export const cleanData = <T extends { [label: string]: any }>(
	obj: T,
	optionalFields: (keyof T)[]
) => {
	const cleanedData = { ...obj };

	Object.entries(obj).forEach(([key, value]) => {
		if (
			optionalFields.includes(key as keyof T) &&
			(value === null || value === undefined || value == "")
		) {
			delete cleanedData[key];
		}
	});

	return cleanedData;
};

export const verifyJSON = <T extends { [label: string]: any }>(
	data: T,
	fields: (keyof T)[] | "all",
	verifyType: "no-empty-string" // fill this in future
) => {
	if (verifyType === "no-empty-string") {
		let errorMsg: string = "Field";
		const fieldsError: (keyof T)[] = [];

		if (Array.isArray(fields)) {
			if (fields.length > 0) errorMsg = "Fields";

			fields.forEach((field) => {
				if (data[field] === "") {
					fieldsError.push(field);
				}
			});
		}

		if (fields === "all") {
			Object.keys(data).forEach((field) => {
				if (data[field] === "") {
					fieldsError.push(field as keyof T);
				}
			});
		}

		if (fieldsError.length > 0) {
			throw new Error(
				`${errorMsg} [${fieldsError.join(", ")}] can't be empty string`
			);
		}
	}
};

export const verifyQuery = <T extends { [label: string]: any }>(
	query: T,
	validFields: (keyof T)[] | { all: "true"; without: (keyof T)[] },
	invalidFields?: (keyof T)[]
) => {
	if (!Array.isArray(validFields)) {
		const newValidItems: (keyof T)[] = [];
		const newInvalidItems: (keyof T)[] = validFields.without.map(
			(item) => item as keyof T
		);

		Object.keys(query).forEach((item) => {
			if (!validFields.without.includes(item)) {
				newValidItems.push(item as keyof T);
			}
		});

		verifyQuery(query, newValidItems, newInvalidItems);
	} else {
		if (validFields.length == 0) return;

		let validFieldsCount = 0;
		let invalidFieldsCount = 0;

		Object.keys(query).forEach((item) => {
			if (validFields.includes(item)) validFieldsCount++;
			if (invalidFields?.includes(item)) invalidFieldsCount++;
		});

		if (invalidFieldsCount > 0 && validFieldsCount > 0) {
			throw new Error(
				`Fields [${invalidFields!.join(
					" | "
				)}] can't be together with [${validFields.join(
					" | "
				)}] field/s`
			);
		}
	}
};

type AdditionalTypes =
	| string
	| number
	| boolean
	| Date
	| ObjectId
	| AddressType
	| null
	| {
			[label: string]: any;
	  };

type NewFieldsType<T> = {
	[label: string]:
		| (keyof T)[]
		| {
				data: (keyof T)[] | AdditionalTypes;
				index: number;
		  }
		| AdditionalTypes;
};

export const formatData = <T extends { [label: string]: any }>(props: {
	data: T;
	newFields?: NewFieldsType<T>;
	deleteFields?: (keyof T)[];
}) => {
	const dataKeys = Object.keys(props.data);
	const keysWithIndex: { [key: string]: number } = {};
	let newData: { [label: string]: any } = { ...props.data };

	// Delete Keys
	dataKeys.forEach((key) => {
		if (props.deleteFields && props.deleteFields.includes(key)) {
			delete newData[key];
		}
	});

	// Validate && create new fields
	const validateValue = (key: string, value: any) => {
		if (value === null || value === undefined) {
			newData[key] = "";
			return;
		}
		
		if (!Array.isArray(value) && !value.data) {
			newData[key] = value;
		}

		// Validate if value is a object
		if (value.data) {
			keysWithIndex[key] = value.index;
			validateValue(key, value.data);
		}

		// Validate if value is a Array
		if (Array.isArray(value)) {
			value.forEach((item) => {
				if (dataKeys.includes(item)) {
					newData[key] =
						newData[key] === "" || newData[key] === undefined
							? props.data[item]
							: newData[key] + " " + props.data[item];
				} else if (Object.keys(newData).includes(item)) {
					newData[key] =
						newData[key] === "" || newData[key] === undefined
							? newData[item]
							: newData[key] + " " + newData[item];
				} else {
					newData[key] =
						newData[key] === "" || newData[key] === undefined
							? item
							: newData[key] + " " + item;
				}
			});
		}
	};

	// Add new fields
	if (props.newFields) {
		Object.entries(props.newFields).forEach(([key, value]) => {
			validateValue(key, value);
		});
	}
	
	// Sort keys by index if index exist
	if (Object.entries(keysWithIndex).length > 0) {
		let entries = Object.entries(newData);

		Object.entries(keysWithIndex)
			.sort((a, b) => a[1] - b[1])
			.forEach(([key, index]) => {
				const value = entries.find(([dataKey]) => dataKey === key);

				if (value) entries.splice(index, 0, value);
			});

		// Delete duplicate keys
		entries = entries.filter(
			(value, index, self) =>
				index ===
				self.findIndex(
					(t) =>
						t[0] === value[0] &&
						JSON.stringify(t[1]) === JSON.stringify(value[1])
				)
		);

		newData = Object.fromEntries(entries);
	}

	return newData;
};

export const formatResponsible = (responsible: UserType) => {
  return formatData({
    data: responsible,
    newFields: {
      fullName: {
        data: ["firstName", "lastName"],
        index: 3,
      },
    },
    deleteFields: [
      "password",
      "email",
      "created_at",
      "updated_at",
      "role",
    ],
  });
};
