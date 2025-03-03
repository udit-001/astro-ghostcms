import { z } from "astro/zod";

const RobotsPolicySchema = z.object({
    /** You must provide a name of the automatic client (search engine crawler).
     * Wildcards are allowed.
     */
    userAgent: z.string(),
    /** Allowed paths for crawling */
    allow: z.string().optional(),
    /** Disallowed paths for crawling */
    disallow: z.string().optional(),
    /** Indicates that the page's URL contains parameters that should be ignored during crawling. 
     * Maximum string length is limited to 500.
    */
    cleanParam: z.string().optional(),
    /** Minimum interval (in secs) for the crawler to wait after loading one page, before starting other */
    crawlDelay: z.number().optional()
  })
  
  export const RobotsTxtSchema = z.object({
     /** @example host: true
     * // Automatically resolve using the site option from Astro config
     * @example host: 'example.com'
     */
    host: z.string().optional(),
    /** @example sitemap: "https://example.com/sitemap-0.xml"
     * @example sitemap: ['https://example.com/sitemap-0.xml','https://example.com/sitemap-1.xml']
     * @example sitemap: false - If you want to get the robots.txt file without the Sitemap: ... entry, set the sitemap parameter to false.
     */
    sitemap: z.union([z.string(), z.string().array(), z.boolean()]).optional(),
    /** astrojs/sitemap and astro-sitemap integrations have the sitemap-index.xml as their primary output. That is why the default value of sitemapBaseFileName is set to sitemap-index.
     * @example sitemapBaseFileName: 'custom-sitemap'
     */
    sitemapBaseFileName: z.string().optional(),
    /** SET POLICY RULES */
    policy: RobotsPolicySchema.array().optional(),
  })
  