import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { env } from "../../env.js";
import { ApiError } from "../../lib/errors.js";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MIME_TO_EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type SupportedImageType = keyof typeof MIME_TO_EXTENSION;

function uploadDirectory() {
  return resolve(process.cwd(), env.IMAGE_UPLOAD_DIR);
}

function hasExpectedSignature(buffer: Buffer, contentType: SupportedImageType) {
  if (contentType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (contentType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export interface StoredProductImage {
  fileName: string;
  imageUrl: string;
}

export async function storeProductImage(
  image: {
    fileName: string;
    contentType: SupportedImageType;
    base64: string;
  },
  publicApiUrl: string,
): Promise<StoredProductImage> {
  if (!/^[a-zA-Z0-9+/]*={0,2}$/.test(image.base64)) {
    throw ApiError.validation("Product image is not valid base64 data");
  }

  const buffer = Buffer.from(image.base64, "base64");
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    throw ApiError.validation("Product image must be no larger than 4 MB");
  }
  if (!hasExpectedSignature(buffer, image.contentType)) {
    throw ApiError.validation(
      "Product image contents do not match its JPEG, PNG, or WebP content type",
    );
  }

  const extension = MIME_TO_EXTENSION[image.contentType];
  const fileName = `${randomUUID()}.${extension}`;
  const directory = uploadDirectory();
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, fileName), buffer, { flag: "wx" });

  return {
    fileName,
    imageUrl: `${publicApiUrl.replace(/\/+$/, "")}/api/catalog/images/${fileName}`,
  };
}

export async function removeProductImage(fileName: string) {
  await unlink(resolve(uploadDirectory(), fileName)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

export async function readProductImage(fileName: string) {
  const match = /^([0-9a-f-]{36})\.(jpg|png|webp)$/.exec(fileName);
  if (!match) throw ApiError.notFound("Product image not found");

  const contentType =
    match[2] === "jpg" ? "image/jpeg" : match[2] === "png" ? "image/png" : "image/webp";

  try {
    return {
      buffer: await readFile(resolve(uploadDirectory(), fileName)),
      contentType,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw ApiError.notFound("Product image not found");
    }
    throw error;
  }
}
