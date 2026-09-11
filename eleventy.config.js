import yaml from "js-yaml";

export default function (eleventyConfig) {
  // Eleventy reads JSON natively but not YAML
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  // Öffnungszeiten ohne schema-Block (Feiertage) gehören nicht in die
  // strukturierten Daten
  eleventyConfig.addFilter("withSchema", (rows) => rows.filter((r) => r.schema));

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/admin");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
}
