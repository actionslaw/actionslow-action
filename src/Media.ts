import * as fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import * as path from "path";
import { URL } from "url";
import * as cache from "@actions/cache";

export class Media {
  static folder: string = path.resolve(`./media`);

  private static async download(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls
        .map((url) => new URL(url))
        .map(async (mediaUrl) => {
          const media = await fetch(mediaUrl);
          if (!fs.existsSync(Media.folder)) fs.mkdirSync(Media.folder);
          const fileName = path.basename(mediaUrl.pathname);
          const destination = path.resolve(Media.folder, fileName);
          const fileStream = fs.createWriteStream(destination, { flags: "w" });
          if (media.body) {
            await finished(Readable.fromWeb(media.body).pipe(fileStream));
          }
        }),
    );
  }

  static async cache(key: string, urls: string[]): Promise<void> {
    if (urls.length > 0) {
      await Media.download(urls);
      await cache.saveCache([`${Media.folder}/**`], key);
    }
  }
}