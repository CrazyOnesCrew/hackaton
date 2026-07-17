module Api
  module V1
    module Management
      class TopicsController < BaseController
        def reorder
          topic = Topic.kept
            .joins(:subject)
            .merge(Subject.kept)
            .find_by(id: params[:id])
          return render_not_found("Topic") unless topic

          exercise_ids = validated_exercise_ids
          Topic.transaction do
            topic.lock!
            reorder_exercises!(topic, exercise_ids)
          end

          render json: { data: { exerciseIds: exercise_ids } }, status: :ok
        end

        private

        def validated_exercise_ids
          raw_ids = request.request_parameters["exerciseIds"]
          fail_validation!("exerciseIds", "must be an array") unless raw_ids.is_a?(Array)

          ids = raw_ids.map(&:to_s)
          if ids.any?(&:blank?) || ids.uniq.length != ids.length
            fail_validation!("exerciseIds", "must contain unique exercise ids")
          end
          ids
        end

        def reorder_exercises!(topic, exercise_ids)
          exercises = topic.exercises.kept.where(id: exercise_ids).index_by { |exercise| exercise.id.to_s }
          unless exercises.keys.sort == exercise_ids.sort
            fail_validation!("exerciseIds", "must contain only exercises from this topic")
          end

          positions = exercises.values.map(&:position).sort
          temporary_start = topic.exercises.maximum(:position).to_i + exercise_ids.length + 1
          now = Time.current

          exercise_ids.each_with_index do |id, index|
            exercises.fetch(id).update_columns(position: temporary_start + index, updated_at: now)
          end
          exercise_ids.each_with_index do |id, index|
            exercises.fetch(id).update_columns(position: positions.fetch(index), updated_at: now)
          end
        end
      end
    end
  end
end
