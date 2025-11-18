const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

export const generateCode = (length = 6): string => {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    code += alphabet[index];
  }
  return code;
};

export const normalizeAlias = (alias: string): string =>
  alias
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
