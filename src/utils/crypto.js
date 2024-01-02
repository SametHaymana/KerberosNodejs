const crypto = require("crypto");

function genSecretKey() {
  return crypto.randomBytes(32).toString("hex");
}

function deriveKey(inputKey, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(inputKey, salt, 100000, 32, "sha256", (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey);
    });
  });
}

async function encrypt(inputKey, text) {
  const salt = crypto.randomBytes(16);
  const key = await deriveKey(inputKey, salt);
  const iv = crypto.randomBytes(12); // 12 bytes IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return (
    iv.toString("hex") +
    ":" +
    encrypted +
    ":" +
    authTag +
    ":" +
    salt.toString("hex")
  );
}

async function decrypt(inputKey, encryptedText) {
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = Buffer.from(parts[1], "hex");
  const authTag = Buffer.from(parts[2], "hex");
  const salt = Buffer.from(parts[3], "hex");
  const key = await deriveKey(inputKey, salt);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  try {
    decrypted += decipher.final("utf8");
  } catch (err) {
    throw new Error("Decryption failed. Unable to authenticate data.");
  }

  return decrypted;
}

module.exports = {
  genSecretKey,
  encrypt,
  decrypt,
};
