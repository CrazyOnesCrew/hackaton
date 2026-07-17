require "test_helper"

module Api
  module V1
    module Management
      class ExercisesControllerTest < ActionDispatch::IntegrationTest
        setup do
          @topic = create_topic
          @auxiliary_headers = auth_headers(user: create_user(role: "auxiliary")).first
          @admin_headers = auth_headers(user: create_user(role: "admin")).first
          @member_headers = auth_headers(user: create_user(role: "member")).first
        end

        test "management endpoints require authentication and a content manager role" do
          exercise = create_exercise(topic: @topic)

          get "/api/v1/management/exercises"
          assert_response :unauthorized

          [
            -> { get "/api/v1/management/exercises", headers: @member_headers },
            -> { get "/api/v1/management/exercises/#{exercise.id}", headers: @member_headers },
            -> { post "/api/v1/management/exercises", params: valid_exercise_payload, headers: @member_headers, as: :json },
            -> { patch "/api/v1/management/exercises/#{exercise.id}", params: { title: "Blocked" }, headers: @member_headers, as: :json },
            -> { delete "/api/v1/management/exercises/#{exercise.id}", headers: @member_headers },
            -> {
              patch "/api/v1/management/topics/#{@topic.id}/reorder",
                params: { exerciseIds: [ exercise.id.to_s ] },
                headers: @member_headers,
                as: :json
            }
          ].each do |request|
            request.call
            assert_response :forbidden
            assert_equal "forbidden", response.parsed_body.dig("error", "code")
          end

          assert_equal exercise.title, exercise.reload.title
          assert exercise.kept?
        end

        test "auxiliary and admin users can list management exercises" do
          create_exercise(topic: @topic)

          get "/api/v1/management/exercises", headers: @auxiliary_headers
          assert_response :ok

          get "/api/v1/management/exercises", headers: @admin_headers
          assert_response :ok
        end

        test "index filters, paginates by 25, and returns complete portal metadata" do
          step = create_step(exercise: create_exercise(topic: @topic))
          step.hints.create!(position: 1, content: "Pista completa", penalty: 3)
          25.times { create_exercise(topic: @topic) }
          other = create_exercise(topic: create_topic, difficulty: "hard")

          get "/api/v1/management/exercises",
            params: { topicId: @topic.id, status: "draft", difficulty: "easy", page: 1 },
            headers: @auxiliary_headers

          assert_response :ok
          assert_equal 25, response.parsed_body["data"].length
          assert_equal(
            { "page" => 1, "totalPages" => 2, "totalCount" => 26 },
            response.parsed_body["meta"]
          )
          first = response.parsed_body["data"].find { |item| item["steps"].any? }
          assert_equal @topic.id.to_s, first["topicId"]
          assert_equal @topic.name, first["topicName"]
          assert_equal "manual", first["source"]
          assert_equal "a", first.dig("steps", 0, "correctAnswer")
          assert_equal "Pista completa", first.dig("steps", 0, "hints", 0, "text")
          refute_includes response.parsed_body["data"].map { |item| item["id"] }, other.id.to_s

          get "/api/v1/management/exercises",
            params: { topicId: @topic.id, page: 2 },
            headers: @auxiliary_headers
          assert_response :ok
          assert_equal 1, response.parsed_body["data"].length
        end

        test "invalid filters return contractual validation details" do
          get "/api/v1/management/exercises",
            params: { status: "unknown", page: 0 },
            headers: @auxiliary_headers

          assert_response :unprocessable_content
          assert_equal "validation_failed", response.parsed_body.dig("error", "code")
          assert_equal "status", response.parsed_body.dig("error", "details", 0, "field")
        end

        test "create persists exercise steps and hints atomically as a draft" do
          assert_difference -> { Exercise.count } => 1,
            -> { ExerciseStep.count } => 1,
            -> { Hint.count } => 1 do
            post "/api/v1/management/exercises",
              params: valid_exercise_payload,
              headers: @auxiliary_headers,
              as: :json
          end

          assert_response :created
          data = response.parsed_body["data"]
          exercise = Exercise.find(data["id"])
          assert exercise.draft?
          assert exercise.manual?
          assert_equal 1, exercise.position
          assert_equal "procedure", data.dig("steps", 0, "phase")
          assert_equal 2, data.dig("steps", 0, "correctAnswer")
          assert_equal "Usa la operación inversa.", data.dig("steps", 0, "hints", 0, "text")
        end

        test "create rolls back every nested record and reports the failing field" do
          payload = valid_exercise_payload
          payload[:steps][0][:hints][0][:content] = ""

          assert_no_difference [ "Exercise.count", "ExerciseStep.count", "Hint.count" ] do
            post "/api/v1/management/exercises",
              params: payload,
              headers: @auxiliary_headers,
              as: :json
          end

          assert_response :unprocessable_content
          assert_equal "validation_failed", response.parsed_body.dig("error", "code")
          assert_equal(
            "steps[0].hints[0].content",
            response.parsed_body.dig("error", "details", 0, "field")
          )
        end

        test "partial update replaces nested content transactionally and publishing controls public visibility" do
          exercise = create_exercise(topic: @topic)

          patch "/api/v1/management/exercises/#{exercise.id}",
            params: { status: "published" },
            headers: @auxiliary_headers,
            as: :json

          assert_response :unprocessable_content
          assert_equal "status", response.parsed_body.dig("error", "details", 0, "field")

          patch "/api/v1/management/exercises/#{exercise.id}",
            params: {
              title: "Título actualizado",
              steps: valid_exercise_payload[:steps]
            },
            headers: @auxiliary_headers,
            as: :json

          assert_response :ok
          assert_equal "draft", response.parsed_body.dig("data", "status")
          assert_equal "Título actualizado", exercise.reload.title
          assert_equal 1, exercise.exercise_steps.count

          patch "/api/v1/management/exercises/#{exercise.id}",
            params: { status: "published" },
            headers: @admin_headers,
            as: :json

          assert_response :ok
          assert_equal "published", response.parsed_body.dig("data", "status")

          get "/api/v1/exercises/#{exercise.id}"
          assert_response :ok
        end

        test "failed nested update restores the previous exercise and children" do
          exercise = create_exercise(topic: @topic, title: "Original")
          original_step = create_step(exercise:)
          invalid_steps = valid_exercise_payload[:steps]
          invalid_steps[0][:hints][0][:content] = ""

          patch "/api/v1/management/exercises/#{exercise.id}",
            params: { title: "Changed", steps: invalid_steps },
            headers: @auxiliary_headers,
            as: :json

          assert_response :unprocessable_content
          exercise.reload
          assert_equal "Original", exercise.title
          assert_equal [ original_step.id ], exercise.exercise_steps.ids
        end

        test "discard returns no content and removes a published exercise from public and management reads" do
          exercise = create_exercise(topic: @topic)
          create_step(
            exercise:,
            phase: "procedure",
            answer_type: "numeric",
            options: [],
            correct_answer: { "value" => 1 }
          )
          exercise.update!(status: "published")

          delete "/api/v1/management/exercises/#{exercise.id}", headers: @auxiliary_headers
          assert_response :no_content
          assert exercise.reload.discarded?

          get "/api/v1/exercises/#{exercise.id}"
          assert_response :not_found
          get "/api/v1/management/exercises/#{exercise.id}", headers: @auxiliary_headers
          assert_response :not_found
        end

        private

        def valid_exercise_payload
          {
            title: "Ecuación de una variable",
            statement: "Resuelve $x + 1 = 3$.",
            topicId: @topic.id,
            difficulty: "easy",
            variables: [],
            steps: [
              {
                phase: "procedure",
                position: 1,
                prompt: "¿Cuál es el valor de x?",
                answerType: "numeric",
                options: [],
                correctAnswer: { value: 2 },
                tolerance: 0.001,
                maxScore: 10,
                hints: [
                  {
                    content: "Usa la operación inversa.",
                    penalty: 2
                  }
                ]
              }
            ]
          }
        end
      end
    end
  end
end
