require "test_helper"

module Api
  module V1
    module Management
      class TopicsControllerTest < ActionDispatch::IntegrationTest
        setup do
          @topic = create_topic
          @headers = auth_headers(user: create_user(role: "auxiliary")).first
          @first = create_exercise(topic: @topic)
          @second = create_exercise(topic: @topic)
          @third = create_exercise(topic: @topic)
        end

        test "reorder assigns the requested topic order" do
          requested_ids = [ @third.id.to_s, @first.id.to_s, @second.id.to_s ]

          patch "/api/v1/management/topics/#{@topic.id}/reorder",
            params: { exerciseIds: requested_ids },
            headers: @headers,
            as: :json

          assert_response :ok
          assert_equal requested_ids, response.parsed_body.dig("data", "exerciseIds")
          assert_equal(
            requested_ids,
            @topic.exercises.kept.order(:position).pluck(:id).map(&:to_s)
          )
        end

        test "reorder rejects exercises from another topic without changing positions" do
          other_exercise = create_exercise(topic: create_topic)
          original_order = @topic.exercises.kept.order(:position).pluck(:id)

          patch "/api/v1/management/topics/#{@topic.id}/reorder",
            params: { exerciseIds: [ @third.id, other_exercise.id ] },
            headers: @headers,
            as: :json

          assert_response :unprocessable_content
          assert_equal "validation_failed", response.parsed_body.dig("error", "code")
          assert_equal "exerciseIds", response.parsed_body.dig("error", "details", 0, "field")
          assert_equal original_order, @topic.exercises.kept.order(:position).pluck(:id)
        end

        test "reorder rejects duplicate exercise ids" do
          patch "/api/v1/management/topics/#{@topic.id}/reorder",
            params: { exerciseIds: [ @first.id, @first.id ] },
            headers: @headers,
            as: :json

          assert_response :unprocessable_content
          assert_equal "exerciseIds", response.parsed_body.dig("error", "details", 0, "field")
        end

        test "reorder returns not found for a discarded topic" do
          @topic.update!(deleted_at: Time.current)

          patch "/api/v1/management/topics/#{@topic.id}/reorder",
            params: { exerciseIds: [] },
            headers: @headers,
            as: :json

          assert_response :not_found
        end
      end
    end
  end
end
