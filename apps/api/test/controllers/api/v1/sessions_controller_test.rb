require "test_helper"

module Api
  module V1
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = User.create!(email: "viajero@example.com", password: "S3guraP@ss", display_name: "Ana", role: "member")
      end

      test "POST create logs in with valid credentials" do
        post api_v1_sessions_path, params: { email: "viajero@example.com", password: "S3guraP@ss" }, as: :json

        assert_response :created
        body = response.parsed_body
        assert_equal "viajero@example.com", body["data"]["user"]["email"]
        assert body["data"]["session"]["token"].present?
      end

      test "POST create rejects invalid password with generic message" do
        post api_v1_sessions_path, params: { email: "viajero@example.com", password: "wrong" }, as: :json

        assert_response :unauthorized
        body = response.parsed_body
        assert_equal "invalid_credentials", body["error"]["code"]
      end

      test "POST create rejects unknown email with the same generic message" do
        post api_v1_sessions_path, params: { email: "unknown@example.com", password: "S3guraP@ss" }, as: :json

        assert_response :unauthorized
        assert_equal "invalid_credentials", response.parsed_body["error"]["code"]
      end

      test "POST create rejects a disabled account" do
        @user.update!(status: "disabled")

        post api_v1_sessions_path, params: { email: "viajero@example.com", password: "S3guraP@ss" }, as: :json

        assert_response :forbidden
        assert_equal "account_disabled", response.parsed_body["error"]["code"]
      end

      test "POST create increments failed_login_attempts on invalid password" do
        post api_v1_sessions_path, params: { email: "viajero@example.com", password: "wrong" }, as: :json

        assert_equal 1, @user.reload.failed_login_attempts
      end

      test "POST create resets failed_login_attempts on success" do
        @user.update!(failed_login_attempts: 2)

        post api_v1_sessions_path, params: { email: "viajero@example.com", password: "S3guraP@ss" }, as: :json

        assert_equal 0, @user.reload.failed_login_attempts
      end

      test "DELETE current revokes the session" do
        session = @user.sessions.create!

        delete api_v1_current_session_path, headers: { "Authorization" => "Bearer #{session.token}" }

        assert_response :no_content
        assert session.reload.revoked_at.present?
      end

      test "DELETE current with an already-revoked token returns unauthorized, not an error" do
        session = @user.sessions.create!

        delete api_v1_current_session_path, headers: { "Authorization" => "Bearer #{session.token}" }
        delete api_v1_current_session_path, headers: { "Authorization" => "Bearer #{session.token}" }

        assert_response :unauthorized
      end

      test "requests with a revoked token are rejected" do
        session = @user.sessions.create!
        session.revoke!

        get api_v1_profile_path, headers: { "Authorization" => "Bearer #{session.token}" }

        assert_response :unauthorized
      end
    end
  end
end
