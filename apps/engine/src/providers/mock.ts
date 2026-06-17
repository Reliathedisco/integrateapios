/*
 * Mock provider.
 *
 * For tests and offline development. You supply a "responder" function
 * that returns the structured object the planner would expect from a
 * real model, given the prompts and schema.
 *
 * Why this exists:
 *   - Unit tests should not hit a paid API
 *   - Lets us assert the planner's prompt construction and validation
 *     paths independently of any specific model's quirks
 *   - Provides a reference implementation for what the LLM is expected
 *     to return for canonical scenarios
 *
 * The responder is async so tests can simulate network latency or
 * delayed failures if useful.
 */

import { z } from "zod";
import type { AIProvider } from "../types";

export interface MockProviderOptions {
  /**
   * Given the prompts + schema, return an object that conforms to the
   * schema. The mock provider runs schema.parse() on the result so
   * tests still exercise validation.
   */
  responder: (input: {
    systemPrompt: string;
    userPrompt: string;
    schemaName: string;
  }) => unknown | Promise<unknown>;
  name?: string;
  model?: string;
}

export class MockProvider implements AIProvider {
  readonly name: string;
  readonly model: string;
  private readonly responder: MockProviderOptions["responder"];

  constructor(opts: MockProviderOptions) {
    this.responder = opts.responder;
    this.name = opts.name ?? "mock";
    this.model = opts.model ?? "mock-model";
  }

  async generateStructured<T>(input: {
    systemPrompt: string;
    userPrompt: string;
    schema: z.ZodType<T>;
    schemaName: string;
    schemaDescription: string;
  }): Promise<T> {
    const raw = await this.responder({
      systemPrompt: input.systemPrompt,
      userPrompt: input.userPrompt,
      schemaName: input.schemaName,
    });
    return input.schema.parse(raw);
  }
}
