/** MIT License

Copyright (c) 2019 Alexander Reardon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const tinyinvariant = "merged"
const isProduction: boolean = process.env.NODE_ENV === 'production';
const prefix: string = 'Invariant failed';

/** Throw an error if the condition is false
 * @example 
 * import { invariant } from '@matthiesenxyz/astro-ghostcms/api';
 * invariant(var, "var is false but its not supposed to be!")
 */
export function invariant(
  // biome-ignore lint/suspicious/noExplicitAny: we know what we are doing
condition: any,
  message?: string | (() => string),
): asserts condition {
  if (condition) {
    return;
  }
  if (isProduction) {
    throw new Error(prefix);
  }

  const provided: string | undefined = typeof message === 'function' ? message() : message;

  const value: string = provided ? `${prefix}: ${provided}` : prefix;
  throw new Error(value);
}