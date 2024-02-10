export function email(value: string): string | undefined {
  const emailReg = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!emailReg.test(value)) return "Enter email is not in correct format.";
  return;
}

export function required(value?: string): string | undefined {
  if (!value || !value.length) return "This is required.";
  return;
}

export function password(value: string): string | undefined {
  if (value.length < 8) return "This must be in at least length of 8 characters.";
  return;
}

export function birthday(value: string): string | undefined {
  const dobReg = new RegExp(/[0-9]{2}\/[0-9]{2}\/[1,2]{1}[0-9]{3}/);
  if (!dobReg.test(value)) {
    return "This must be in format of DD/MM/YYYY";
  }
  try {
    const day = Number(value.substring(0, 2));
    const month = Number(value.substring(3, 5));
    const year = Number(value.substring(6));

    if (isNaN(month) || isNaN(year) || isNaN(day)) return "Invalid day, month or year";
    if (day < 1 || day > 31) return "Invalid day";
    if (month < 1 || month > 12) return "Invalid month";
    if (year >= new Date().getFullYear()) return "Invalid year";
  } catch (error) {
    return "Invalid format";
  }
  return;
}
