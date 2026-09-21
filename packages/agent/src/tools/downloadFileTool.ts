import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export type FileDownloader = (filename: string) => Promise<string>;

export function createFileDownloadTool(downloadFile: FileDownloader) {
  return tool(
    async ({ filename }: { filename: string }) => downloadFile(filename),
    {
      name: 'download_file',
      description: 'Read a file by filename and return its contents.',
      schema: z.object({ filename: z.string().describe('The filename or path to read') }),
    },
  );
}
