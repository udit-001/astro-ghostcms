import type { Page, Post } from "./content-api/schemas";
import { TS_API } from "./content-api";

// LOAD ENVIRONMENT VARIABLES
import { loadEnv } from 'vite';

import config from "../integrations/virtual-config";

const CONF_URL = config.ghostURL;

const {
  CONTENT_API_KEY, 
  CONTENT_API_URL
} = loadEnv('all',process.cwd(),'CONTENT_');

const ghostApiKey = CONTENT_API_KEY;
const ghostUrl = CONF_URL ? CONF_URL : CONTENT_API_URL;
const version = "v5.0";
const api = new TS_API(ghostUrl, ghostApiKey, version);

export const getAllAuthors = async () => {
  const results = await api.authors
    .browse()
    .include({ "count.posts": true })
    .fetch();
  if (!results.success) {
    throw new Error(results.errors.map((e) => e.message).join(", "));
  }
  return {
    authors: results.data,
    meta: results.meta,
  };
};

export const getPosts = async () => {
  const results = await api.posts
    .browse()
    .include({
      authors: true,
      tags: true,
    })
    .fetch();
  if (!results.success) {
    throw new Error(results.errors.map((e) => e.message).join(", "));
  }
  return {
    posts: results.data,
    meta: results.meta,
  };
};

export const getAllPosts = async () => {
  const posts: Post[] = [];
  let cursor = await api.posts
    .browse()
    .include({
      authors: true,
      tags: true,
    })
    .paginate();
  if (cursor.current.success) posts.push(...cursor.current.data);
  while (cursor.next) {
    cursor = await cursor.next.paginate();
    if (cursor.current.success) posts.push(...cursor.current.data);
  }
  return posts;
};

export const getAllPages = async () => {
  const pages: Page[] = [];
  let cursor = await api.pages
    .browse()
    .include({
      authors: true,
      tags: true,
    })
    .paginate();
  if (cursor.current.success) pages.push(...cursor.current.data);
  while (cursor.next) {
    cursor = await cursor.next.paginate();
    if (cursor.current.success) pages.push(...cursor.current.data);
  }
  return pages;
};

export const getSettings = async () => {
  const res = await api.settings.fetch();
  if (res.success) {
    return res.data;
  }
  return null;
};

export const getAllTags = async () => {
  const results = await api.tags
    .browse()
    .include({ "count.posts": true })
    .fetch();
  if (!results.success) {
    throw new Error(results.errors.map((e) => e.message).join(", "));
  }
  return {
    tags: results.data,
    meta: results.meta,
  };
};

export const getFeaturedPosts = async () => {
  const results = await api.posts
    .browse({ filter: "featured:true" })
    .include({
      authors: true,
      tags: true,
    })
    .fetch();
  if (!results.success) {
    throw new Error(results.errors.map((e) => e.message).join(", "));
  }
  return {
    posts: results.data,
    meta: results.meta,
  };
};