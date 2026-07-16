require "test_helper"

module Api
  module V1
    class ProfilesControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = User.create!(email: "viajero@example.com", password: "S3guraP@ss", display_name: "Ana", role: "member")
        @session = @user.sessions.create!
        @headers = { "Authorization" => "Bearer #{@session.token}" }
      end

      test "GET show returns the authenticated user's profile" do
        get api_v1_profile_path, headers: @headers

        assert_response :ok
        body = response.parsed_body
        assert_equal @user.email, body["data"]["email"]
        assert_equal @user.display_name, body["data"]["displayName"]
        assert_equal "member", body["data"]["role"]
      end

      test "GET show requires authentication" do
        get api_v1_profile_path

        assert_response :unauthorized
      end

      test "PATCH update changes displayName" do
        patch api_v1_profile_path, params: { displayName: "Ana María" }, headers: @headers, as: :json

        assert_response :ok
        assert_equal "Ana María", response.parsed_body["data"]["displayName"]
        assert_equal "Ana María", @user.reload.display_name
      end

      test "PATCH update changes email" do
        patch api_v1_profile_path, params: { email: "ana.nueva@example.com" }, headers: @headers, as: :json

        assert_response :ok
        assert_equal "ana.nueva@example.com", response.parsed_body["data"]["email"]
      end

      test "PATCH update rejects a duplicate email" do
        User.create!(email: "otra@example.com", password: "S3guraP@ss", display_name: "Otra", role: "member")

        patch api_v1_profile_path, params: { email: "otra@example.com" }, headers: @headers, as: :json

        assert_response :unprocessable_content
        assert_equal "validation_error", response.parsed_body["error"]["code"]
      end

      test "PATCH update ignores role changes" do
        patch api_v1_profile_path, params: { role: "admin" }, headers: @headers, as: :json

        assert_response :ok
        assert_equal "member", @user.reload.role
      end
    end
  end
end
