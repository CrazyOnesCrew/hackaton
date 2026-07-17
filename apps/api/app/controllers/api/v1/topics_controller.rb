module Api
  module V1
    class TopicsController < ApplicationController
      def index
        subject = Subject.kept.find_by(slug: params[:slug])
        return render_not_found unless subject

        topics = subject.topics.kept
          .left_joins(:exercises)
          .select(
            "topics.*",
            difficulty_count_sql("easy"),
            difficulty_count_sql("medium"),
            difficulty_count_sql("hard")
          )
          .group("topics.id")
          .order(:position, :id)

        render json: { data: topics.map { |topic| topic_payload(topic) } }, status: :ok
      end

      private

      def difficulty_count_sql(difficulty)
        difficulty_value = Exercise.difficulties.fetch(difficulty)
        published_value = Exercise.statuses.fetch("published")
        <<~SQL.squish
          COUNT(*) FILTER (
            WHERE exercises.deleted_at IS NULL
              AND exercises.status = #{published_value}
              AND exercises.difficulty = #{difficulty_value}
          ) AS #{difficulty}_count
        SQL
      end

      def topic_payload(topic)
        {
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          position: topic.position,
          exerciseCounts: {
            easy: topic[:easy_count].to_i,
            medium: topic[:medium_count].to_i,
            hard: topic[:hard_count].to_i
          }
        }
      end

      def render_not_found
        render json: {
          error: {
            code: "not_found",
            message: "Subject not found."
          }
        }, status: :not_found
      end
    end
  end
end
