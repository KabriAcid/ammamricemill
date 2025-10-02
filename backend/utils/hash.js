import argon2 from "argon2";

export async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id, // Argon2id variant - best for general password hashing
    memoryCost: 65536, // 64 MB in KiB (recommended minimum)
    timeCost: 3, // Number of iterations
    parallelism: 4, // Parallel threads
    saltLength: 16, // Salt length in bytes
    hashLength: 32, // Hash length in bytes
  });
}

export async function verifyPassword(password, hash) {
  try {
    // Check if hash is in correct format
    if (!hash || typeof hash !== "string" || !hash.startsWith("$")) {
      console.error("Invalid hash format");
      return false;
    }
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}
