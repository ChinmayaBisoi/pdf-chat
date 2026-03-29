import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "@/lib/uploadthing";

const handlers = createRouteHandler({
  router: uploadRouter,
});

export const { POST, GET } = handlers;
