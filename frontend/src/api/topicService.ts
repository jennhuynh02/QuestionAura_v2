import axiosInstance from "./axiosInstance";
import type { components } from "../types/api";

// Use generated types from OpenAPI schema
export type TopicResponse = components["schemas"]["TopicResponse"];
export type TopicCreate = components["schemas"]["TopicCreate"];
export type TopicUpdate = components["schemas"]["TopicUpdate"];

export const topicService = {
  /**
   * Get all topics.
   */
  getAllTopics: async (): Promise<TopicResponse[]> => {
    const { data } = await axiosInstance.get<TopicResponse[]>("/topics");
    return data;
  },

  /**
   * Get topic by ID.
   */
  getTopicById: async (id: number): Promise<TopicResponse> => {
    const { data } = await axiosInstance.get<TopicResponse>(`/topics/${id}`);
    return data;
  },

  /**
   * Create a new topic. Requires authentication.
   */
  createTopic: async (topicData: TopicCreate): Promise<TopicResponse> => {
    const { data } = await axiosInstance.post<TopicResponse>(
      "/topics",
      topicData
    );
    return data;
  },

  /**
   * Update a topic. Requires authentication.
   */
  updateTopic: async (
    id: number,
    topicData: TopicUpdate
  ): Promise<TopicResponse> => {
    const { data } = await axiosInstance.put<TopicResponse>(
      `/topics/${id}`,
      topicData
    );
    return data;
  },

  /**
   * Delete a topic. Requires authentication.
   */
  deleteTopic: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/topics/${id}`);
  },
};
