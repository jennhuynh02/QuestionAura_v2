import axiosInstance from "./axiosInstance";
import type { components, operations } from "../types/api";

// Use generated types from OpenAPI schema
export type QuestionResponse = components["schemas"]["QuestionResponse"];
export type QuestionCreate = components["schemas"]["QuestionCreate"];
export type QuestionUpdate = components["schemas"]["QuestionUpdate"];
export type PaginatedQuestionResponse =
  components["schemas"]["PaginatedQuestionResponse"];

// Extract query parameters from the generated operation type
export type QuestionQueryParams =
  operations["get_all_questions_questions_get"]["parameters"]["query"];

export const questionService = {
  /**
   * Get all questions with optional filters and pagination.
   */
  getAllQuestions: async (
    params?: QuestionQueryParams
  ): Promise<PaginatedQuestionResponse> => {
    const { data } = await axiosInstance.get<PaginatedQuestionResponse>(
      "/questions",
      {
        params,
      }
    );
    return data;
  },

  /**
   * Get question by ID.
   */
  getQuestionById: async (id: number): Promise<QuestionResponse> => {
    const { data } = await axiosInstance.get<QuestionResponse>(
      `/questions/${id}`
    );
    return data;
  },

  /**
   * Create a new question. Requires authentication.
   * asker_id is automatically set from the current user.
   */
  createQuestion: async (
    questionData: QuestionCreate
  ): Promise<QuestionResponse> => {
    const { data } = await axiosInstance.post<QuestionResponse>(
      "/questions",
      questionData
    );
    return data;
  },

  /**
   * Update a question. Requires authentication.
   * Only the asker can update their own questions.
   */
  updateQuestion: async (
    id: number,
    questionData: QuestionUpdate
  ): Promise<QuestionResponse> => {
    const { data } = await axiosInstance.put<QuestionResponse>(
      `/questions/${id}`,
      questionData
    );
    return data;
  },

  /**
   * Delete a question. Requires authentication.
   * Only the asker can delete their own questions.
   */
  deleteQuestion: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/questions/${id}`);
  },
};
