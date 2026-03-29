import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/chat(.*)",
  "/api/uploadthing(.*)",
  "/api/ingest(.*)",
  "/api/chat(.*)",
  "/api/usage(.*)",
]);

/**
 * UploadThing POSTs callback/error notifications to `/api/uploadthing` from their
 * infrastructure (signed requests, no browser cookies). Do not require Clerk
 * here or uploads hang waiting for `onUploadComplete` / client completion.
 */
function isUploadThingServerHook(req: Request) {
  return req.headers.get("uploadthing-hook") != null;
}

export default clerkMiddleware(async (auth, req) => {
  if (isUploadThingServerHook(req)) {
    return;
  }
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
