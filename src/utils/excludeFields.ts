export const excludeFields = (queryString:any,excludedFields:string[]) => {
  const queryObj = {...queryString};

  excludedFields.forEach((el) => delete queryObj[el]);

  return queryObj;
};
