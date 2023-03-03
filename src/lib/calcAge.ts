import differenceInYears from "date-fns/differenceInYears";

export const calcAge = (birthDate: Date) => {
  differenceInYears(birthDate, new Date());
};
