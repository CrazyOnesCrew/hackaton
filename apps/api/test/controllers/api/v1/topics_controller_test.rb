require "test_helper"

module Api
  module V1
    class TopicsControllerTest < ActionDispatch::IntegrationTest
      test "GET index returns kept topics with published kept exercise counts by difficulty" do
        subject = create_subject(name: "Álgebra", position: 1)
        equations = create_topic(subject:, name: "Ecuaciones", position: 2)
        fractions = create_topic(subject:, name: "Fracciones", position: 1)

        2.times { create_published_exercise(topic: equations, difficulty: "easy") }
        create_published_exercise(topic: equations, difficulty: "medium")
        create_exercise(topic: equations, difficulty: "hard")
        create_exercise(topic: equations, difficulty: "hard", status: "archived")
        discarded = create_published_exercise(topic: equations, difficulty: "hard")
        discarded.update!(deleted_at: Time.current)

        create_published_exercise(topic: fractions, difficulty: "hard")
        empty_topic = create_topic(subject:, name: "Sin publicaciones", position: 3)
        removed_topic = create_topic(subject:, name: "Eliminado", position: 4, deleted_at: Time.current)
        create_published_exercise(topic: removed_topic, difficulty: "easy")

        assert_select_query_count(2) { get "/api/v1/subjects/#{subject.slug}/topics" }

        assert_response :ok
        assert_equal(
          [
            {
              "id" => fractions.id,
              "name" => "Fracciones",
              "slug" => "fracciones",
              "position" => 1,
              "exerciseCounts" => { "easy" => 0, "medium" => 0, "hard" => 1 }
            },
            {
              "id" => equations.id,
              "name" => "Ecuaciones",
              "slug" => "ecuaciones",
              "position" => 2,
              "exerciseCounts" => { "easy" => 2, "medium" => 1, "hard" => 0 }
            },
            {
              "id" => empty_topic.id,
              "name" => "Sin publicaciones",
              "slug" => "sin-publicaciones",
              "position" => 3,
              "exerciseCounts" => { "easy" => 0, "medium" => 0, "hard" => 0 }
            }
          ],
          response.parsed_body["data"]
        )
      end

      test "GET index returns an empty list publicly for a subject without topics" do
        subject = create_subject

        get "/api/v1/subjects/#{subject.slug}/topics",
          headers: { "Authorization" => "Bearer invalid" }

        assert_response :ok
        assert_equal({ "data" => [] }, response.parsed_body)
      end

      test "GET index returns the standard not found envelope for an unknown subject" do
        get "/api/v1/subjects/unknown/topics"

        assert_response :not_found
        assert_equal(
          {
            "error" => {
              "code" => "not_found",
              "message" => "Subject not found."
            }
          },
          response.parsed_body
        )
      end

      test "GET index treats a discarded subject as not found" do
        subject = create_subject(deleted_at: Time.current)

        get "/api/v1/subjects/#{subject.slug}/topics"

        assert_response :not_found
        assert_equal "not_found", response.parsed_body.dig("error", "code")
      end

      private

      def create_published_exercise(topic:, difficulty:)
        exercise = create_exercise(topic:, difficulty:)
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

      def assert_select_query_count(expected, &)
        count = 0
        callback = lambda do |_name, _started, _finished, _unique_id, payload|
          count += 1 if payload[:sql].start_with?("SELECT") && payload[:name] != "SCHEMA" && !payload[:cached]
        end

        ActiveSupport::Notifications.subscribed(callback, "sql.active_record", &)
        assert_equal expected, count
      end
    end
  end
end
