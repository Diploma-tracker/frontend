export interface KeyExtractionRule {
  /** Unique identifier for this rule */
  name: string;
  /**
   * Extract i18n key strings from the content of a single file.
   * Returns an array of flat dot-notation keys found.
   */
  extract(content: string, filePath: string): string[];
}
