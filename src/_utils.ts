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
			})
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

		Object.keys(query).forEach((item) => {
			if (invalidFields?.includes(item)) {
				throw new Error(
					`Fields [${invalidFields.join(
						" | "
					)}] can't be together with [${validFields.join(
						" | "
					)}] field/s`
				);
			}
		});
	}
};

export const formatData = <T extends { [label: string]: any }>(props: {
	data: T;
	newFields?: { [label: string]: any | keyof T | (keyof T)[] };
	deleteFields?: (keyof T)[];
}) => {
	const newData: { [label: string]: any } = { ...props.data };
	const dataKeys = Object.keys(props.data);

	dataKeys.forEach((key) => {
		if (props.deleteFields && props.deleteFields.includes(key)) {
			delete newData[key];
		}
	});

	if (props.newFields) {
		Object.entries(props.newFields).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				value.forEach((item) => {
					if (dataKeys.includes(item)) {
						newData[key] =
							newData[key] === "" || newData[key] === undefined
								? props.data[item]
								: newData[key] + " " + props.data[item];
					} else {
						newData[key] =
							newData[key] === "" || newData[key] === undefined
								? item
								: newData[key] + " " + item;
					}
				});
			} else if (dataKeys.includes(value)) {
				newData[key] = props.data[value];
			} else {
				newData[key] = value;
			}
		});
	}

	return newData;
};
