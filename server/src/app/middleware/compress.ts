import { NextFunction, Request, Response } from "express";
import { Transform } from "stream";
import {
  createBrotliCompress,
  createGzip,
  constants as zlibConstants,
  BrotliOptions,
  ZlibOptions,
} from "zlib";

/**
 * Lightweight gzip/brotli response compression for compressible (JSON/text)
 * payloads, using node:zlib so no extra dependency is needed.
 *
 * Compression is decided lazily on the first write, when Express has already
 * set Content-Type — that way non-compressible responses (media streams, etc.)
 * pass through untouched. Must be mounted AFTER the raw Stripe webhook route so
 * webhook bodies are never altered.
 */
const COMPRESSIBLE_TYPES =
  /^(text\/|application\/(json|javascript|xml|x-www-form-urlencoded|.*\+json)|image\/svg\+xml)/;

const COMPRESSION_LEVEL = 6;

const gzipOptions: ZlibOptions = { level: COMPRESSION_LEVEL };
const brotliOptions: BrotliOptions = {
  params: { [zlibConstants.BROTLI_PARAM_QUALITY]: COMPRESSION_LEVEL },
};

export const compress =
  () => (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    const acceptEncoding = req.headers["accept-encoding"];
    if (typeof acceptEncoding !== "string") {
      next();
      return;
    }

    const useBrotli = /\bbr\b/.test(acceptEncoding);
    const useGzip = /\bgzip\b/.test(acceptEncoding);
    if (!useBrotli && !useGzip) {
      next();
      return;
    }

    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    let stream: Transform | null = null;

    const compressible = () => {
      if (res.getHeader("Content-Encoding")) return false;
      const type = String(res.getHeader("Content-Type") ?? "");
      if (!COMPRESSIBLE_TYPES.test(type)) return false;
      const status = res.statusCode;
      if (status === 204 || status === 304) return false;
      return true;
    };

    const startStream = () => {
      stream = useBrotli
        ? createBrotliCompress(brotliOptions)
        : createGzip(gzipOptions);

      res.setHeader("Content-Encoding", useBrotli ? "br" : "gzip");
      res.removeHeader("Content-Length");
      const vary = res.getHeader("Vary");
      res.setHeader(
        "Vary",
        vary ? `${String(vary)}, Accept-Encoding` : "Accept-Encoding",
      );

      stream.on("data", (chunk) => originalWrite(chunk));
      stream.on("end", () => originalEnd());
      stream.on("error", (error) => {
        console.error("[compress] stream error:", error.message);
        stream = null;
        res.removeHeader("Content-Encoding");
        res.write = originalWrite;
        res.end = originalEnd;
        if (res.headersSent) {
          originalEnd();
        }
      });

      // Client disconnected — stop compressing to avoid leaks.
      res.on("close", () => {
        if (!res.writableEnded) {
          stream?.destroy();
        }
      });
    };

    const passthrough = () => {
      res.write = originalWrite;
      res.end = originalEnd;
    };

    const endOriginal = (
      chunk?: unknown,
      encoding?: BufferEncoding,
      callback?: () => void,
    ) => {
      if (encoding !== undefined) {
        return originalEnd(chunk, encoding, callback);
      }
      if (chunk !== undefined) {
        return originalEnd(chunk, callback);
      }
      return originalEnd(callback);
    };

    type WriteArgs = Parameters<typeof res.write>;
    type EndArgs = Parameters<typeof res.end>;

    res.write = ((chunk: WriteArgs[0], encoding?: WriteArgs[1], callback?: WriteArgs[2]) => {
      if (!stream) {
        if (!compressible()) {
          passthrough();
          return originalWrite(chunk, encoding ?? "utf8", callback);
        }
        startStream();
      }
      return stream!.write(chunk, encoding ?? "utf8", callback);
    }) as typeof res.write;

    res.end = ((chunk?: EndArgs[0], encoding?: EndArgs[1], callback?: EndArgs[2]) => {
      if (!stream) {
        if (chunk) {
          if (!compressible()) {
            passthrough();
            return endOriginal(chunk, encoding, callback);
          }
          startStream();
          return stream!.end(chunk, encoding ?? "utf8", callback);
        }
        // No body (e.g. HEAD or 204) — leave the response untouched.
        passthrough();
        return endOriginal(chunk, encoding, callback);
      }
      if (chunk) {
        return stream!.end(chunk, encoding ?? "utf8", callback);
      }
      return stream!.end();
    }) as typeof res.end;

    next();
  };
