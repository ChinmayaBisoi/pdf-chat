export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits. Try again later or contact support.");
    this.name = "InsufficientCreditsError";
  }
}
