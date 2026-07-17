module Api
  module V1
    module Management
      class ExercisesController < BaseController
        PAGE_SIZE = 25
        MANAGEMENT_PHASES = {
          "identification" => "identification",
          "planning" => "strategy",
          "tools" => "verification",
          "procedure" => "procedure"
        }.freeze

        def index
          scope = apply_filters(management_exercises)
          page = requested_page
          total_count = scope.count
          exercises = scope.order(:topic_id, :position, :id)
            .offset((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)

          render json: {
            data: exercises.map { |exercise| exercise_payload(exercise) },
            meta: {
              page:,
              totalPages: [ (total_count.to_f / PAGE_SIZE).ceil, 1 ].max,
              totalCount: total_count
            }
          }, status: :ok
        end

        def show
          exercise = management_exercises.find_by(id: params[:id])
          return render_not_found("Exercise") unless exercise

          render json: { data: exercise_payload(exercise) }, status: :ok
        end

        def create
          payload = request.request_parameters
          exercise = Exercise.transaction do
            topic = find_topic!(payload["topicId"])
            topic.lock!

            created = topic.exercises.new(
              position: topic.exercises.maximum(:position).to_i + 1,
              status: :draft,
              source: :manual
            )
            assign_exercise_attributes!(created, payload)
            save_record!(created, nil)
            replace_steps!(created, payload["steps"]) if payload.key?("steps")
            created
          end

          render json: { data: exercise_payload(reload_for_payload(exercise)) }, status: :created
        end

        def update
          exercise = management_exercises.find_by(id: params[:id])
          return render_not_found("Exercise") unless exercise

          Exercise.transaction do
            exercise.lock!
            move_to_topic!(exercise, request.request_parameters["topicId"]) if request.request_parameters.key?("topicId")
            assign_exercise_attributes!(exercise, request.request_parameters)
            replace_steps!(exercise, request.request_parameters["steps"]) if request.request_parameters.key?("steps")
            assign_enum!(exercise, :status, request.request_parameters["status"], "status") if request.request_parameters.key?("status")
            save_record!(exercise, nil)
          end

          render json: { data: exercise_payload(reload_for_payload(exercise)) }, status: :ok
        end

        def destroy
          exercise = management_exercises.find_by(id: params[:id])
          return render_not_found("Exercise") unless exercise

          exercise.update_column(:deleted_at, Time.current)
          head :no_content
        end

        private

        def management_exercises
          Exercise.kept
            .joins(topic: :subject)
            .merge(Topic.kept)
            .merge(Subject.kept)
            .includes(:topic, exercise_steps: :hints)
        end

        def reload_for_payload(exercise)
          management_exercises.find(exercise.id)
        end

        def apply_filters(scope)
          filtered = scope
          if params[:topicId].present?
            topic_id = Integer(params[:topicId], exception: false)
            fail_validation!("topicId", "must be a positive integer") unless topic_id&.positive?
            filtered = filtered.where(topic_id:)
          end

          if params[:status].present?
            fail_validation!("status", "is invalid") unless Exercise.statuses.key?(params[:status])
            filtered = filtered.where(status: Exercise.statuses.fetch(params[:status]))
          end

          if params[:difficulty].present?
            fail_validation!("difficulty", "is invalid") unless Exercise.difficulties.key?(params[:difficulty])
            filtered = filtered.where(difficulty: Exercise.difficulties.fetch(params[:difficulty]))
          end

          filtered
        end

        def requested_page
          page = Integer(params.fetch(:page, 1), exception: false)
          fail_validation!("page", "must be a positive integer") unless page&.positive?
          page
        end

        def find_topic!(id)
          fail_validation!("topicId", "is required") if id.blank?

          topic = Topic.kept
            .joins(:subject)
            .merge(Subject.kept)
            .find_by(id:)
          fail_validation!("topicId", "does not reference an available topic") unless topic
          topic
        end

        def move_to_topic!(exercise, topic_id)
          topic = find_topic!(topic_id)
          return if exercise.topic_id == topic.id

          topic.lock!
          exercise.topic = topic
          exercise.position = topic.exercises.maximum(:position).to_i + 1
        end

        def assign_exercise_attributes!(exercise, payload)
          exercise.title = payload["title"] if payload.key?("title")
          exercise.statement = payload["statement"] if payload.key?("statement")
          exercise.variables = payload["variables"] if payload.key?("variables")
          assign_enum!(exercise, :difficulty, payload["difficulty"], "difficulty") if payload.key?("difficulty")
        end

        def replace_steps!(exercise, raw_steps)
          fail_validation!("steps", "must be an array") unless raw_steps.is_a?(Array)

          exercise.exercise_steps.destroy_all
          raw_steps.each_with_index do |raw_step, step_index|
            fail_validation!("steps[#{step_index}]", "must be an object") unless raw_step.is_a?(Hash)

            step = exercise.exercise_steps.new
            assign_step_attributes!(step, raw_step, step_index)
            save_record!(step, "steps[#{step_index}]")
            create_hints!(step, raw_step["hints"], step_index) if raw_step.key?("hints")
          end
        end

        def assign_step_attributes!(step, payload, index)
          step.position = payload.fetch("position", index + 1)
          step.prompt = payload["prompt"]
          step.options = sanitize_options(payload.fetch("options", []))
          step.correct_answer = normalized_correct_answer(payload["answerType"], payload["correctAnswer"])
          step.tolerance = payload["tolerance"] if payload.key?("tolerance")
          step.max_score = payload["maxScore"] if payload.key?("maxScore")
          assign_enum!(step, :phase, payload["phase"], "steps[#{index}].phase")
          assign_enum!(step, :answer_type, payload["answerType"], "steps[#{index}].answerType")
        end

        def sanitize_options(options)
          return options unless options.is_a?(Array)

          options.map do |option|
            next option unless option.is_a?(Hash)

            { "id" => option["id"], "label" => option["label"] }
          end
        end

        def normalized_correct_answer(answer_type, answer)
          case answer_type
          when "single_choice"
            answer.is_a?(String) ? [ answer ] : answer
          when "numeric"
            answer.is_a?(Numeric) ? { "value" => answer } : answer
          when "expression"
            answer.is_a?(String) ? { "expression" => answer } : answer
          else
            answer
          end
        end

        def create_hints!(step, raw_hints, step_index)
          fail_validation!("steps[#{step_index}].hints", "must be an array") unless raw_hints.is_a?(Array)

          raw_hints.each_with_index do |raw_hint, hint_index|
            field = "steps[#{step_index}].hints[#{hint_index}]"
            fail_validation!(field, "must be an object") unless raw_hint.is_a?(Hash)

            hint = step.hints.new(
              position: raw_hint.fetch("position", hint_index + 1),
              content: raw_hint["content"] || raw_hint["text"],
              penalty: raw_hint["penalty"] || raw_hint["penaltyPercent"] || 2
            )
            save_record!(hint, field)
          end
        end

        def exercise_payload(exercise)
          {
            id: exercise.id.to_s,
            title: exercise.title,
            statement: exercise.statement,
            difficulty: exercise.difficulty,
            status: exercise.status,
            source: exercise.xml_import? ? "xml" : "manual",
            position: exercise.position,
            topicId: exercise.topic_id.to_s,
            topicName: exercise.topic.name,
            variables: exercise.variables,
            updatedAt: exercise.updated_at.iso8601,
            steps: exercise.exercise_steps.map { |step| step_payload(step) }
          }
        end

        def step_payload(step)
          {
            id: step.id.to_s,
            phase: MANAGEMENT_PHASES.fetch(step.phase),
            position: step.position,
            prompt: step.prompt,
            answerType: step.answer_type,
            options: step.options,
            correctAnswer: correct_answer_payload(step),
            tolerance: step.tolerance.to_f,
            maxScore: step.max_score,
            hints: step.hints.map do |hint|
              {
                id: hint.id.to_s,
                position: hint.position,
                text: hint.content,
                penaltyPercent: hint.penalty
              }
            end
          }
        end

        def correct_answer_payload(step)
          answer = step.correct_answer
          return answer.first if step.single_choice? && answer.is_a?(Array)
          return answer["value"] if step.numeric? && answer.is_a?(Hash)
          return answer["expression"] if step.expression? && answer.is_a?(Hash)

          answer
        end
      end
    end
  end
end
