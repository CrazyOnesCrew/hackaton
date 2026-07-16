require "test_helper"

module Api
  module V1
    class RegistrationsControllerTest < ActionDispatch::IntegrationTest
      test "POST create registers a member and returns a session" do
        post api_v1_registrations_path, params: {
          email: "viajero@example.com",
          password: "S3guraP@ss",
          displayName: "Ana"
        }, as: :json

        assert_response :created
        body = response.parsed_body
        assert_equal "viajero@example.com", body["data"]["user"]["email"]
        assert_equal "member", body["data"]["user"]["role"]
        assert_equal "Ana", body["data"]["user"]["displayName"]
        assert body["data"]["session"]["token"].present?
        assert body["data"]["session"]["expiresAt"].present?
      end

      test "POST create rejects duplicate email" do
        User.create!(email: "viajero@example.com", password: "S3guraP@ss", display_name: "Ana", role: "member")

        post api_v1_registrations_path, params: {
          email: "viajero@example.com",
          password: "S3guraP@ss",
          displayName: "Otra"
        }, as: :json

        assert_response :unprocessable_content
        body = response.parsed_body
        assert_equal "validation_error", body["error"]["code"]
        assert_includes body["error"]["details"].map { |d| d["field"] }, "email"
      end

      test "POST create rejects weak password" do
        post api_v1_registrations_path, params: {
          email: "viajero@example.com",
          password: "short",
          displayName: "Ana"
        }, as: :json

        assert_response :unprocessable_content
      end

      test "POST create ignores role param and always creates a member" do
        post api_v1_registrations_path, params: {
          email: "viajero@example.com",
          password: "S3guraP@ss",
          displayName: "Ana",
          role: "admin"
        }, as: :json

        assert_response :created
        assert_equal "member", response.parsed_body["data"]["user"]["role"]
      end
    end
  end
end
