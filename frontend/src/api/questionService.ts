import axiosInstance from "./axiosInstance";
import type { components } from "../types/api";

export type QuestionResponse = components["schemas"]["QuestionResponse"];
export type QuestionCreate = components["schemas"]["QuestionCreate"];
export type QuestionUpdate = components["schemas"]["QuestionUpdate"];

export interface QuestionQueryParams {
  topic_id?: number;
  asker_id?: number;
}

export const questionService = {
  /**
   * Get all questions with optional filters.
   */
  getAllQuestions: async (
    params?: QuestionQueryParams
  ): Promise<QuestionResponse[]> => {
    const { data } = await axiosInstance.get<QuestionResponse[]>("/questions", {
      params,
    });
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

