import yaml from "js-yaml";

export default function (eleventyConfig) {
  // Eleventy reads JSON natively but not YAML
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  // style.css and main.js sit at the root until Phase 3 moves them, so the
  // Phase 1 parity diff sees the same asset paths as the prototype
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/main.js");

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/img");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
}
