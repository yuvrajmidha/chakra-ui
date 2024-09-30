/* eslint-disable prefer-const */

import { FormData } from "../../config/schema/formTypes";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const convertRef = (refData: any, field: any) => {
  if (Array.isArray(refData?.data)) {
    return refData?.data.map((value: any) => ({
      id: value?.id,
      value: value?.attributes[field],
      label: value?.attributes[field],
    }));
  } else
    return {
      id: refData?.data?.id,
      value: refData?.data?.attributes[field],
      label: refData?.data?.attributes[field],
    };
};
export const convertRefUser = (refData: any, field: any) => {
  console.log("ref", refData)
  if (Array.isArray(refData?.data)) {
    return refData?.data.map((value: any) => ({
      id: value?.id,
      value: value[field],
      label: value[field],
    }));
  } else
    return {
      id: refData.id,
      value: refData[field],
      label: refData[field],
    };
};

export const populateData = (
  view: any[],
  initialData?: any,
  collectionName?: string
) => {
  let obj: any = {};

  for (let i = 0; i < view.length; i++) {
    const {
      schema,
      type,
      name,
    }: { schema: FormData[]; type: string; name: string } = view[i];

    if (type === "Basic") {
      obj[`${name}`] = {};

      for (let k = 0; k < schema.length; k++) {
        const field = schema[k];
        try {
          if (field.type === "ref:strapi") {
            if (collectionName === "users") {
              if (field.multiple) {
                obj[`${name}`][`${field.name}`] = convertRefUser(
                  initialData[`${field.name}`],
                  field.rules?.field
                );
              } else {
                obj[`${name}`][`${field.name}`] = convertRefUser(
                  initialData[`${field.name}`],
                  field.rules?.field
                );
              }

            } else {
              if (field.multiple) {
                obj[`${name}`][`${field.name}`] = convertRef(
                  initialData[`${field.name}`],
                  field.rules?.field
                );
              } else {
                obj[`${name}`][`${field.name}`] = convertRef(
                  initialData[`${field.name}`],
                  field.rules?.field
                );
              }
            }
          } else {
            obj[`${name}`][`${field.name}`] = initialData[`${field.name}`];
          }
        } catch (e) {
          console.log(e);
        }
      }
    } else if (type === "Component") {
      obj[`${name}`] = {};
      for (let k = 0; k < schema.length; k++) {
        const field = schema[k];
        try {
          if (field.type === "ref:strapi") {
            obj[`${name}`][`${field.name}`] = convertRef(
              initialData[`${name}`][`${field.name}`],
              field.rules?.field
            );
          } else {
            obj[`${name}`][`${field.name}`] =
              initialData[`${name}`][`${field.name}`];
          }
        } catch (e: any) {
          console.log(e);
        }
      }
    } else {
      obj[`${name}`] = [];
      for (let i = 0; i < initialData[`${name}`]?.length; i++) {
        const element = initialData[`${name}`][i];
        obj[`${name}`][i] = { id: element?.id };
        for (let k = 0; k < schema.length; k++) {
          const field = schema[k];
          if (field.type === "ref:strapi") {
            obj[`${name}`][i][`${field.name}`] = convertRef(
              Object.hasOwn(element || {}, field.name)
                ? element[`${field.name}`]
                : { data: null },
              field.rules?.field
            );
          } else
            obj[`${name}`][i][`${field.name}`] = Object.hasOwn(
              element || {},
              field.name
            )
              ? element[`${field.name}`]
              : null;
        }
      }
    }
  }
  return obj;
};

export const apiFetch = async (
  url: string,
  options: any = {},
  onSuccess?: (data: any, method: string) => void
) => {
  try {
    const response = await fetch(url, {
      ...options,
    });
    const data = await response.json();

    if (onSuccess) onSuccess(response, options);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
