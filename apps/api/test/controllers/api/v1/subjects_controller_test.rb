require "test_helper"

module Api
  module V1
    class SubjectsControllerTest < ActionDispatch::IntegrationTest
      test "GET index returns only kept subjects with kept topics containing published kept exercises" do
        algebra = create_subject(name: "Álgebra", position: 2)
        equations = create_topic(subject: algebra, name: "Ecuaciones", position: 1)
        create_published_exercise(topic: equations)
        create_published_exercise(topic: equations)
        create_published_exercise(topic: create_topic(subject: algebra, name: "Polinomios", position: 2))
        create_topic(subject: algebra, name: "Vacío", position: 3)
        draft_topic = create_topic(subject: algebra, name: "Solo borradores", position: 4)
        create_exercise(topic: draft_topic)
        discarded_algebra_topic = create_topic(
          subject: algebra,
          name: "Descartado",
          position: 5,
          deleted_at: Time.current
        )
        create_published_exercise(topic: discarded_algebra_topic)

        arithmetic = create_subject(name: "Aritmética", position: 1)
        create_published_exercise(topic: create_topic(subject: arithmetic, name: "Fracciones", position: 1))

        draft_only = create_subject(name: "Borradores", position: 3)
        create_exercise(topic: create_topic(subject: draft_only))
        archived_only = create_subject(name: "Archivados", position: 4)
        create_exercise(topic: create_topic(subject: archived_only), status: "archived")
        create_subject(name: "Sin temas", position: 5)

        discarded_subject = create_subject(name: "Materia eliminada", position: 6, deleted_at: Time.current)
        create_published_exercise(topic: create_topic(subject: discarded_subject))

        discarded_topic_subject = create_subject(name: "Tema eliminado", position: 7)
        discarded_topic = create_topic(subject: discarded_topic_subject, deleted_at: Time.current)
        create_published_exercise(topic: discarded_topic)

        discarded_exercise_subject = create_subject(name: "Ejercicio eliminado", position: 8)
        discarded_exercise = create_published_exercise(topic: create_topic(subject: discarded_exercise_subject))
        discarded_exercise.update!(deleted_at: Time.current)

        assert_select_query_count(1) { get "/api/v1/subjects" }

        assert_response :ok
        assert_equal(
          [
            {
              "id" => arithmetic.id,
              "name" => "Aritmética",
              "slug" => "aritmetica",
              "position" => 1,
              "topicsCount" => 1
            },
            {
              "id" => algebra.id,
              "name" => "Álgebra",
              "slug" => "algebra",
              "position" => 2,
              "topicsCount" => 4
            }
          ],
          response.parsed_body["data"]
        )
      end

      test "GET index remains public with an invalid authorization header" do
        subject = create_subject
        create_published_exercise(topic: create_topic(subject:))

        get "/api/v1/subjects", headers: { "Authorization" => "Bearer invalid" }

        assert_response :ok
        assert_equal [ subject.id ], response.parsed_body.fetch("data").pluck("id")
      end

      private

      def create_published_exercise(topic:)
        exercise = create_exercise(topic:)
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
