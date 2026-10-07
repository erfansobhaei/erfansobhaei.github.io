import MarkdownIt from "markdown-it";
import yaml from "js-yaml";

const md = new MarkdownIt({ html: true, linkify: false, typographer: true });

export default function (eleventyConfig) {
  // Support .yaml / .yml files in `src/_data/`.
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

  // Copy static assets straight through to the built site.
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/assets/files");

  eleventyConfig.addTemplateFormats(["md", "css"]);

  // Render a short Markdown string inline (used for bios, author lists...).
  eleventyConfig.addFilter("md", function (value) {
    return value ? md.renderInline(String(value)) : "";
  });

  // Render a full Markdown block (used for research abstracts).
  eleventyConfig.addFilter("mdBlock", function (value) {
    return value ? md.render(String(value)) : "";
  });

  // RSS/sitemap helpers.
  eleventyConfig.addFilter("dateToRfc822", function (date) {
    return new Date(date).toUTCString();
  });

  eleventyConfig.addFilter("dateToIso", function (date) {
    return new Date(date).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("getNewestCollectionItemDate", function (collection) {
    if (!collection || !collection.length) {
      return new Date();
    }
    return new Date(Math.max(...collection.map((item) => item.date)));
  });

  // Calendar year, used for the copyright line. Accepts a date, or the string
  // "now" (or nothing) for the current year.
  eleventyConfig.addFilter("year", function (date) {
    const parsed = !date || date === "now" ? new Date() : new Date(date);
    const safe = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return safe.getFullYear();
  });

  eleventyConfig.addFilter("limit", function (array, limit) {
    return array.slice(0, limit);
  });

  // Sort a list of objects by a numeric field, newest (largest) first by default.
  eleventyConfig.addFilter("sortBy", function (array, key, direction = "desc") {
    if (!Array.isArray(array)) {
      return [];
    }
    const sign = direction === "asc" ? 1 : -1;
    return [...array].sort(
      (a, b) => sign * (Number(a?.[key] ?? 0) - Number(b?.[key] ?? 0)),
    );
  });

  eleventyConfig.addFilter("truncate", function (str, length = 200) {
    if (!str) return "";
    return str.length > length ? str.substring(0, length) + "..." : str;
  });

  return {
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
}
