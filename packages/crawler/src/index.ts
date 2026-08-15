export async function scheduleCrawl(
  _sourceId: string,
  _url: string,
  _jobId: string
): Promise<void> {
  throw new Error(
    "Crawler not yet implemented — set up Playwright + BullMQ in packages/crawler"
  );
}
