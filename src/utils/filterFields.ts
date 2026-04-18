export const filterFields = (
  unFilteredObject: any,
  ...allowedFields: string[]
) => {
  const filteredObject: any = {};
  Object.keys(unFilteredObject).forEach((el) => {
    if (allowedFields.includes(el)) {
      filteredObject[el] = unFilteredObject[el];
    }
  });

  return filteredObject;
};
