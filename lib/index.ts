import {
  parseFromRaw,
  type ParserConfig,
  type FeedParserResult,
} from "./src/parser";

export { parseFromRaw, type ParserConfig, type FeedParserResult };
export {
  assembleTimeline,
  type TimelinePost,
  type TimelineResult,
} from "./src/timeline";
export type {
  Feed,
  Post,
  DebugMessage,
  Severity,
  Rfc3339Date,
} from "./src/types";

const SUPPORTED_FORMATS = Object.freeze({
  markdown: {
    suffix: ["md", "markdown"],
    nativeMetaData: false,
  },
  asciidoc: {
    suffix: ["adoc", "asciidoc"],
    nativeMetaData: true, // TODO
  },
  // TODO:
  //orgmode: {
  //  suffix: ['org'],
  //  nativeMetaData: true,
  //},
  text: {
    suffix: ["txt", "text"],
    nativeMetaData: false,
  },
});

export default function parseFeed(
  feedString: string,
  fileType?: string,
  feedConfig?: ParserConfig,
  postConfig?: ParserConfig,
) {
  // TODO: handle different file types
  return parseFromRaw(feedString, feedConfig, postConfig);
}
