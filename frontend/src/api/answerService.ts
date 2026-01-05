import axiosInstance from "./axiosInstance";
import type { components, operations } from "../types/api";

// Use generated types from OpenAPI schema
export type AnswerResponse = components["schemas"]["AnswerResponse"];
export type AnswerCreate = components["schemas"]["AnswerCreate"];
export type AnswerUpdate = components["schemas"]["AnswerUpdate"];

// Extract query parameters from the generated operation type
export type AnswerQueryParams =
  operations["get_all_answers_answers_get"]["parameters"]["query"];

export const answerService = {
  /**
   * Get all answers with optional filter.
   */
  getAllAnswers: async (
    params?: AnswerQueryParams
  ): Promise<AnswerResponse[]> => {
    const { data } = await axiosInstance.get<AnswerResponse[]>("/answers", {
      params,
    });
    return data;
  },

  /**
   * Get answer by ID.
   */
  getAnswerById: async (id: number): Promise<AnswerResponse> => {
    const { data } = await axiosInstance.get<AnswerResponse>(`/answers/${id}`);
    return data;
  },

  /**
   * Create a new answer. Requires authentication.
   * responder_id is automatically set from the current user.
   */
  createAnswer: async (answerData: AnswerCreate): Promise<AnswerResponse> => {
    const { data } = await axiosInstance.post<AnswerResponse>(
      "/answers",
      answerData
    );
    return data;
  },

  /**
   * Update an answer. Requires authentication.
   * Only the responder can update their own answers.
   */
  updateAnswer: async (
    id: number,
    answerData: AnswerUpdate
  ): Promise<AnswerResponse> => {
    const { data } = await axiosInstance.put<AnswerResponse>(
      `/answers/${id}`,
      answerData
    );
    return data;
  },

  /**
   * Delete an answer. Requires authentication.
   * Only the responder can delete their own answers.
   */
  deleteAnswer: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/answers/${id}`);
  },
};
