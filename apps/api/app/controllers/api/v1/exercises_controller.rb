module Api
  module V1
    class ExercisesController < ApplicationController
      def show
        exercise = public_exercises.find_by(id: params[:id])
        return render_not_found unless exercise

        render json: { data: exercise_payload(exercise) }, status: :ok
      end

      private

      def public_exercises
        Exercise.kept
          .published
          .joins(topic: :subject)
          .merge(Topic.kept)
          .merge(Subject.kept)
          .includes(exercise_steps: :hints)
      end

      def exercise_payload(exercise)
        {
          id: exercise.id,
          title: exercise.title,
          statement: exercise.statement,
          difficulty: exercise.difficulty,
          topicId: exercise.topic_id,
          steps: exercise.exercise_steps.map { |step| step_payload(step) }
        }
      end

      def step_payload(step)
        payload = {
          id: step.id,
          phase: step.phase,
          position: step.position,
          prompt: step.prompt,
          answerType: step.answer_type,
          hintsAvailable: step.hints.size,
          maxScore: step.max_score
        }
        payload[:options] = public_options(step.options) if step.single_choice? || step.multi_choice?
        payload
      end

      def public_options(options)
        options.map do |option|
          {
            id: option["id"],
            label: option["label"]
          }
        end
      end

      def render_not_found
        render json: {
          error: {
            code: "not_found",
            message: "Exercise not found."
          }
        }, status: :not_found
      end
    end
  end
end
