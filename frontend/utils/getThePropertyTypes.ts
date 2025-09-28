export const getThePropertyTypes = (value?: string) => {
  switch (value) {
    case "rent":
      return "שכירות";
    case "sale":
      return "מכירה";
       case "house":
      return "בית";
       case "office":
      return "משרד";
       case "land":
      return "קרקע";
    default:
      return value || "-";
  }
};