require "test_helper"

module Api
  module V1
    class ExercisesControllerTest < ActionDispatch::IntegrationTest
      test "GET show returns the exact public shape without answers or hint content" do
        topic = create_topic
        exercise = create_exercise(
          topic:,
          title: "Ecuación con signos",
          statement: "Resuelve $2x + 3 = -5$",
          difficulty: "medium",
          variables: [ { "name" => "VARIABLE_SENTINEL", "domain" => { "min" => -10, "max" => 10 } } ]
        )
        choice_step = create_step(
          exercise:,
          options: [
            {
              "id" => "a",
              "label" => "Ecuación lineal",
              "correct" => true,
              "solution" => "OPTION_SOLUTION_SENTINEL",
              "metadata" => { "isCorrect" => true }
            },
            { "id" => "b", "label" => "Ecuación cuadrática", "correct" => false }
          ]
        )
        choice_step.hints.create!(position: 1, content: "Secret hint content", penalty: 2)
        choice_step.hints.create!(position: 2, content: "Another secret hint", penalty: 1)
        multi_choice_step = create_step(
          exercise:,
          phase: "planning",
          position: 2,
          prompt: "Selecciona ambas operaciones.",
          answer_type: "multi_choice",
          options: [
            { "id" => "a", "label" => "Restar 3" },
            { "id" => "b", "label" => "Dividir entre 2" },
            { "id" => "c", "label" => "Elevar al cuadrado" }
          ],
          correct_answer: [ "a", "b" ]
        )
        numeric_step = create_step(
          exercise:,
          phase: "procedure",
          position: 3,
          prompt: "¿Cuál es el valor de x?",
          answer_type: "numeric",
          options: [],
          correct_answer: { "value" => -4 },
          tolerance: 0.123456789,
          max_score: 20
        )
        numeric_step.hints.create!(position: 1, content: "Do not expose me", penalty: 2)
        expression_step = create_step(
          exercise:,
          phase: "procedure",
          position: 4,
          prompt: "Escribe una expresión equivalente.",
          answer_type: "expression",
          options: [],
          correct_answer: { "expression" => "EXPRESSION_ANSWER_SENTINEL" }
        )
        exercise.update!(status: "published")

        assert_select_query_count(3) { get "/api/v1/exercises/#{exercise.id}" }

        assert_response :ok
        assert_equal(
          {
            "data" => {
              "id" => exercise.id,
              "title" => "Ecuación con signos",
              "statement" => "Resuelve $2x + 3 = -5$",
              "difficulty" => "medium",
              "topicId" => topic.id,
              "steps" => [
                {
                  "id" => choice_step.id,
                  "phase" => "identification",
                  "position" => 1,
                  "prompt" => "What kind of equation is this?",
                  "answerType" => "single_choice",
                  "options" => [
                    { "id" => "a", "label" => "Ecuación lineal" },
                    { "id" => "b", "label" => "Ecuación cuadrática" }
                  ],
                  "hintsAvailable" => 2,
                  "maxScore" => 10
                },
                {
                  "id" => multi_choice_step.id,
                  "phase" => "planning",
                  "position" => 2,
                  "prompt" => "Selecciona ambas operaciones.",
                  "answerType" => "multi_choice",
                  "options" => [
                    { "id" => "a", "label" => "Restar 3" },
                    { "id" => "b", "label" => "Dividir entre 2" },
                    { "id" => "c", "label" => "Elevar al cuadrado" }
                  ],
                  "hintsAvailable" => 0,
                  "maxScore" => 10
                },
                {
                  "id" => numeric_step.id,
                  "phase" => "procedure",
                  "position" => 3,
                  "prompt" => "¿Cuál es el valor de x?",
                  "answerType" => "numeric",
                  "hintsAvailable" => 1,
                  "maxScore" => 20
                },
                {
                  "id" => expression_step.id,
                  "phase" => "procedure",
                  "position" => 4,
                  "prompt" => "Escribe una expresión equivalente.",
                  "answerType" => "expression",
                  "hintsAvailable" => 0,
                  "maxScore" => 10
                }
              ]
            }
          },
          response.parsed_body
        )
        assert_no_sensitive_keys(response.parsed_body)
        [
          "OPTION_SOLUTION_SENTINEL",
          "EXPRESSION_ANSWER_SENTINEL",
          "VARIABLE_SENTINEL",
          "Secret hint content",
          "Another secret hint",
          "Do not expose me",
          "0.123456789"
        ].each { |sentinel| refute_includes response.body, sentinel }
      end

      test "GET show returns not found for a draft exercise" do
        exercise = create_exercise

        get "/api/v1/exercises/#{exercise.id}"

        assert_not_found
      end

      test "GET show returns not found for a discarded published exercise" do
        exercise = create_published_exercise
        exercise.update!(deleted_at: Time.current)

        get "/api/v1/exercises/#{exercise.id}"

        assert_not_found
      end

      test "GET show returns not found for an archived exercise" do
        exercise = create_published_exercise
        exercise.update!(status: "archived")

        get "/api/v1/exercises/#{exercise.id}"

        assert_not_found
      end

      test "GET show returns not found when its topic is discarded" do
        exercise = create_published_exercise
        exercise.topic.update!(deleted_at: Time.current)

        get "/api/v1/exercises/#{exercise.id}"

        assert_not_found
      end

      test "GET show returns not found when its subject is discarded" do
        exercise = create_published_exercise
        exercise.topic.subject.update!(deleted_at: Time.current)

        get "/api/v1/exercises/#{exercise.id}"

        assert_not_found
      end

      test "GET show returns not found for an unknown exercise" do
        get "/api/v1/exercises/999999999"

        assert_not_found
      end

      test "GET show returns not found for a malformed exercise id" do
        get "/api/v1/exercises/not-an-id"

        assert_not_found
      end

      test "GET show remains public with an invalid authorization header" do
        exercise = create_published_exercise

        get "/api/v1/exercises/#{exercise.id}", headers: { "Authorization" => "Bearer invalid" }

        assert_response :ok
        assert_equal exercise.id, response.parsed_body.dig("data", "id")
      end

      private

      def create_published_exercise
        exercise = create_exercise
        create_step(
          exercise:,
          phase: "procedure",
          prompt: "Answer",
          answer_type: "numeric",
          options: [],
          correct_answer: { "value" => 1 }
        )
        exercise.update!(status: "published")
        exercise
      end

      def assert_not_found
        assert_response :not_found
        assert_equal(
          {
            "error" => {
              "code" => "not_found",
              "message" => "Exercise not found."
            }
          },
          response.parsed_body
        )
      end

      def assert_select_query_count(expected, &)
        count = 0
        callback = lambda do |_name, _started, _finished, _unique_id, payload|
          count += 1 if payload[:sql].start_with?("SELECT") && payload[:name] != "SCHEMA" && !payload[:cached]
        end

        ActiveSupport::Notifications.subscribed(callback, "sql.active_record", &)
        assert_equal expected, count
      end

      def assert_no_sensitive_keys(value)
        forbidden_keys = %w[
          correct_answer correctAnswer correct isCorrect solution hints content penalty tolerance variables
        ]
        exposed_keys = recursive_keys(value)

        assert_empty forbidden_keys & exposed_keys
      end

      def recursive_keys(value)
        case value
        when Hash
          value.flat_map { |key, nested_value| [ key.to_s, *recursive_keys(nested_value) ] }
        when Array
          value.flat_map { |nested_value| recursive_keys(nested_value) }
        else
          []
        end
      end
    end
  end
end
