import { generateKey } from "openpgp"; // no default export ??
import { v4 as uuidv4, validate as uuidValidate } from "uuid";


async function generatePGPKeys(email: string, passphrase: string) {
  return await generateKey({
    userIDs: [{ email: email }],
    curve: "ed25519",
    passphrase: passphrase,
  });
}

const generateUUID = () => {
  return uuidv4();
};


export { generatePGPKeys, generateUUID, uuidValidate };
