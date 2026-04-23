export const formatDate = (date: Date | string | number) => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return "N/A";
  
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC", 
  });
};
