
export const filterFields = (queryString: any, ...notAllowedFields: string[])=>{
  const filteredQueryString:any = {};
  const queryKeys = Object.keys(queryString);

  queryKeys.forEach(curQueryKey => !notAllowedFields.includes(curQueryKey) ? filteredQueryString[curQueryKey] = queryString[curQueryKey] : "")
  
  return filteredQueryString;
}