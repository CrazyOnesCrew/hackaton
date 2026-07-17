module Api
  module V1
    class SubjectsController < ApplicationController
      def index
        subjects_with_published_content = Topic.kept
          .joins(:exercises)
          .merge(Exercise.kept.published)
          .select(:subject_id)

        subjects = Subject.kept
          .where(id: subjects_with_published_content)
          .joins(:topics)
          .merge(Topic.kept)
          .select("subjects.*, COUNT(DISTINCT topics.id) AS topics_count")
          .group("subjects.id")
          .order(:position, :id)

        render json: { data: subjects.map { |subject| subject_payload(subject) } }, status: :ok
      end

      private

      def subject_payload(subject)
        {
          id: subject.id,
          name: subject.name,
          slug: subject.slug,
          position: subject.position,
          topicsCount: subject[:topics_count].to_i
        }
      end
    end
  end
end
