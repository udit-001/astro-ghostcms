import { z } from 'astro/zod';
import { SitemapSchema, RobotsTxtSchema } from './index';

export const UserConfigSchema = z.object({
  /** OPTIONAL - Either set the URL in your .env or put it here
   * @example
   * // https://astro.build/config
   * export default defineConfig({
   *   integrations: [
   *     ghostcms({
   *       ghostURL: "https://ghostdemo.matthiesen.xyz"
   *     })
   *   ],
   * }); */
  ghostURL: z.string().url().optional(),
  /** OPTIONAL - Allows the user to disable the `/rss.xml` injection */
  disableRSS: z.boolean().default(false),
  /** OPTIONAL - Allows the user to disable the `/open-graph/*` route injection 
   * @ This feature uses `satori` to generate OpenGraph Images
  */
  disableSatoriOG: z.boolean().default(false),
  /** OPTIONAL - Allows the user to disable the `/404` injection */
  disable404: z.boolean().default(false),
  /** OPTIONAL - Disable Route Injector
   * This option allows the user to disable the route injection system and utilize just the integraions other functions. Such as API, sitemap and robotstxt integrations. */
  disableRouteInjection: z.boolean().default(false),
  /** OPTIONAL - (Default: true) Allows the user to disable "info" console output */
  disableConsoleOutput: z.boolean().default(true),
  /** OPTIONAL - Theme Selector
   * This option allows the user to replace the included theme with an external npm module 
   * @example
   * // https://astro.build/config
   * export default defineConfig({
   *   integrations: [
   *     ghostcms({
   *       theme: "@matthiesenxyz/astro-ghostcms-theme-default"
   *     })
   *   ],
   * }); */
  theme: z.string().default('@matthiesenxyz/astro-ghostcms-theme-default'),
  /** OPTIONAL - astrojs/sitemap
   * This option allows the user to configure the included integration 
   * Options shown are the availble options 
   * REFERENCE https://docs.astro.build/en/guides/integrations-guide/sitemap
    */
  sitemap: SitemapSchema.optional(),
  /** OPTIONAL - astro-robots-txt 
   * This option allows the user to configure the included integration 
   * Options shown are the availble options
   * REFERENCE https://www.npmjs.com/package/astro-robots-txt#configuration
    */
  robotstxt: RobotsTxtSchema.optional(),
});

/** USER CONFIGURATION SCHEMA */
export type UserConfig = z.infer<typeof UserConfigSchema>
export type GhostUserConfig = z.infer<typeof UserConfigSchema>